import uuid
from datetime import datetime, timezone
from decimal import Decimal
from html import escape

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity

from app.extensions import db
from app.infrastructure.email_service import branded_html, send_html
from app.infrastructure.persistence.models import ExamAttemptModel, EnrollmentModel, UserModel
from app.presentation.auth_api import role_required

exam_api = Blueprint("exams", __name__)


def safe_send(to, subject, html):
    try:
        send_html(to, subject, html)
    except Exception:
        current_app.logger.exception("No se pudo enviar el correo %s", subject)


def course_lessons(enrollment):
    return [lesson for module in enrollment.course.modules for lesson in module.lessons]


def lessons_are_complete(enrollment):
    return len(enrollment.lesson_progress) >= len(course_lessons(enrollment))


def passed_attempt(enrollment):
    return next((attempt for attempt in enrollment.exam_attempts if attempt.status == "PASSED"), None)


def student_exam_state(enrollment):
    exam = enrollment.course.final_exam
    attempts = list(enrollment.exam_attempts)
    passed = passed_attempt(enrollment)
    pending = next((attempt for attempt in attempts if attempt.status == "PENDING_REVIEW"), None)
    lessons_complete = lessons_are_complete(enrollment)
    attempts_used = len(attempts)
    attempts_allowed = exam.attempts_allowed if exam else 0
    return {
        "lessonsComplete": lessons_complete,
        "attemptsUsed": attempts_used,
        "attemptsAllowed": attempts_allowed,
        "attemptsRemaining": max(0, attempts_allowed - attempts_used),
        "pendingReview": pending is not None,
        "courseCompleted": passed is not None,
        "passedScore": float(passed.score) if passed else None,
        "canAttempt": bool(
            exam
            and exam.questions
            and lessons_complete
            and not passed
            and not pending
            and attempts_used < attempts_allowed
        ),
        "attempts": [
            {
                "id": str(attempt.id),
                "number": attempt.attempt_number,
                "status": attempt.status,
                "score": float(attempt.score) if attempt.status == "PASSED" else None,
                "feedback": attempt.feedback if attempt.status == "FAILED_REVIEWED" else "",
                "submittedAt": attempt.submitted_at.isoformat(),
            }
            for attempt in attempts
        ],
    }


def student_enrollment(enrollment_id):
    try:
        enrollment_uuid = uuid.UUID(enrollment_id)
    except ValueError:
        return None
    enrollment = db.session.get(EnrollmentModel, enrollment_uuid)
    if not enrollment or enrollment.student_id != uuid.UUID(get_jwt_identity()):
        return None
    return enrollment


def serialize_exam_for_student(exam):
    return {
        "id": str(exam.id),
        "title": exam.title,
        "instructions": exam.instructions,
        "timeLimitMinutes": exam.time_limit_minutes,
        "passingScore": exam.passing_score,
        "attemptsAllowed": exam.attempts_allowed,
        "questions": [
            {
                "id": str(question.id),
                "prompt": question.prompt,
                "options": question.options,
                "points": question.points,
            }
            for question in exam.questions
        ],
    }


@exam_api.get("/student/enrollments/<enrollment_id>")
@role_required("student")
def get_student_exam(enrollment_id):
    enrollment = student_enrollment(enrollment_id)
    if not enrollment:
        return jsonify({"message": "No tienes acceso a esta evaluación."}), 404
    exam = enrollment.course.final_exam
    if not exam or not exam.questions:
        return jsonify({"message": "El examen final aún no está configurado."}), 404
    return jsonify({"exam": serialize_exam_for_student(exam), "state": student_exam_state(enrollment)})


@exam_api.get("/student/certificates")
@role_required("student")
def student_certificates():
    """Issue certificates only from completed enrollments backed by a passed exam."""
    student_id = uuid.UUID(get_jwt_identity())
    enrollments = (
        EnrollmentModel.query.filter_by(student_id=student_id)
        .order_by(EnrollmentModel.completed_at.desc())
        .all()
    )
    certificates = []
    for enrollment in enrollments:
        attempt = passed_attempt(enrollment)
        if not attempt or not enrollment.completed_at:
            continue
        course = enrollment.course
        year = enrollment.completed_at.year
        certificates.append(
            {
                "id": str(enrollment.id),
                "courseSlug": course.slug,
                "courseName": course.name,
                "studentName": f"{enrollment.student.first_name} {enrollment.student.last_name}".strip(),
                "issuedAt": enrollment.completed_at.isoformat(),
                "endorsement": course.endorsement or course.certification,
                "duration": course.duration,
                "score": float(attempt.score),
                "code": f"AC-{year}-{str(course.id)[:6].upper()}-{str(enrollment.id)[:6].upper()}",
            }
        )
    return jsonify({"certificates": certificates})


@exam_api.post("/student/enrollments/<enrollment_id>/submit")
@role_required("student")
def submit_student_exam(enrollment_id):
    enrollment = student_enrollment(enrollment_id)
    if not enrollment:
        return jsonify({"message": "No tienes acceso a esta evaluación."}), 404
    exam = enrollment.course.final_exam
    state = student_exam_state(enrollment)
    if not state["lessonsComplete"]:
        return jsonify({"message": "Completa todas las lecciones antes de rendir el examen."}), 409
    if state["pendingReview"]:
        return jsonify({"message": "Tu intento anterior todavía está siendo revisado."}), 409
    if not state["canAttempt"]:
        return jsonify({"message": "No tienes intentos disponibles para esta evaluación."}), 409
    answers = (request.get_json(silent=True) or {}).get("answers") or {}
    question_ids = {str(question.id) for question in exam.questions}
    if set(answers.keys()) != question_ids:
        return jsonify({"message": "Responde todas las preguntas antes de enviar."}), 400
    total_points = sum(question.points for question in exam.questions)
    earned_points = 0
    snapshot = []
    normalized_answers = {}
    for question in exam.questions:
        question_id = str(question.id)
        try:
            selected = int(answers[question_id])
        except (TypeError, ValueError):
            return jsonify({"message": "Una de las respuestas no es válida."}), 400
        if selected < 0 or selected >= len(question.options):
            return jsonify({"message": "Una de las respuestas no es válida."}), 400
        normalized_answers[question_id] = selected
        if selected in question.correct_answers:
            earned_points += question.points
        snapshot.append(
            {
                "questionId": question_id,
                "prompt": question.prompt,
                "options": question.options,
                "correctAnswers": question.correct_answers,
                "selectedAnswer": selected,
                "points": question.points,
            }
        )
    score = round(earned_points * 100 / total_points, 2) if total_points else 0
    passed = score >= exam.passing_score
    submitted_at = datetime.now(timezone.utc)
    attempt = ExamAttemptModel(
        enrollment=enrollment,
        attempt_number=len(enrollment.exam_attempts) + 1,
        answers=normalized_answers,
        questions_snapshot=snapshot,
        score=Decimal(str(score)),
        passed=passed,
        status="PASSED" if passed else "PENDING_REVIEW",
        submitted_at=submitted_at,
    )
    db.session.add(attempt)
    enrollment.exam_submitted_at = submitted_at
    if passed:
        enrollment.exam_score = Decimal(str(score))
        enrollment.completed_at = datetime.now(timezone.utc)
        enrollment.progress_percent = 100
    else:
        enrollment.exam_score = None
        enrollment.progress_percent = 90
    db.session.commit()
    student = enrollment.student
    course = enrollment.course
    if passed:
        safe_send(
            student.email,
            "¡Aprobaste tu curso! — Alianza Contigo",
            branded_html(
                "¡Felicitaciones, aprobaste!",
                f"Hola {escape(student.first_name)},",
                f"Aprobaste el examen final de <strong>{escape(course.name)}</strong> con una calificación de <strong>{score}/100</strong>. Tu curso está completado.<br><br>La academia se contactará contigo para realizar la entrega del certificado oficial.",
                "Reclamar mi certificado",
                f'{current_app.config["FRONTEND_URL"]}/app/certificates',
            ),
        )
        return jsonify({"passed": True, "score": score, "courseCompleted": True, "message": "¡Aprobaste el examen final!"})

    teachers = UserModel.query.filter_by(role="teacher", is_active=True).all()
    recipients = [teacher.email for teacher in teachers] or [current_app.config["MAIL_RECIPIENT"]]
    for recipient in recipients:
        safe_send(
            recipient,
            f"Examen reprobado pendiente de retroalimentación · {course.name}",
            branded_html(
                "Evaluación pendiente de revisión",
                "Hola docente,",
                f"<strong>{escape(student.first_name)} {escape(student.last_name)}</strong> no alcanzó el puntaje mínimo en el intento {attempt.attempt_number} del examen final de <strong>{escape(course.name)}</strong>. Ingresa para revisar sus respuestas, registrar retroalimentación y habilitar el siguiente intento si corresponde.",
                "Revisar evaluación",
                f'{current_app.config["FRONTEND_URL"]}/profesor/cursos/{course.slug}',
            ),
        )
    return jsonify({"passed": False, "status": "PENDING_REVIEW", "message": "Tu examen fue enviado al docente para revisión. Recibirás su retroalimentación por correo."})


def serialize_teacher_attempt(attempt, detailed=False):
    data = {
        "id": str(attempt.id),
        "studentName": f"{attempt.enrollment.student.first_name} {attempt.enrollment.student.last_name}",
        "studentEmail": attempt.enrollment.student.email,
        "courseName": attempt.enrollment.course.name,
        "courseSlug": attempt.enrollment.course.slug,
        "attemptNumber": attempt.attempt_number,
        "score": float(attempt.score),
        "passingScore": attempt.enrollment.course.final_exam.passing_score,
        "status": attempt.status,
        "submittedAt": attempt.submitted_at.isoformat(),
        "feedback": attempt.feedback,
    }
    if detailed:
        data["questions"] = attempt.questions_snapshot
    return data


@exam_api.get("/teacher/attempts")
@role_required("teacher", "admin")
def teacher_attempts():
    status = request.args.get("status", "PENDING_REVIEW")
    query = ExamAttemptModel.query
    if status in {"PENDING_REVIEW", "FAILED_REVIEWED", "PASSED"}:
        query = query.filter_by(status=status)
    rows = query.order_by(ExamAttemptModel.submitted_at.desc()).all()
    return jsonify({"attempts": [serialize_teacher_attempt(attempt) for attempt in rows]})


@exam_api.get("/teacher/attempts/<attempt_id>")
@role_required("teacher", "admin")
def teacher_attempt_detail(attempt_id):
    try:
        attempt = db.session.get(ExamAttemptModel, uuid.UUID(attempt_id))
    except ValueError:
        attempt = None
    if not attempt:
        return jsonify({"message": "Intento no encontrado."}), 404
    return jsonify(serialize_teacher_attempt(attempt, detailed=True))


@exam_api.patch("/teacher/attempts/<attempt_id>/review")
@role_required("teacher", "admin")
def review_failed_attempt(attempt_id):
    try:
        attempt = db.session.get(ExamAttemptModel, uuid.UUID(attempt_id))
    except ValueError:
        attempt = None
    if not attempt or attempt.status != "PENDING_REVIEW":
        return jsonify({"message": "Esta evaluación ya fue revisada o no existe."}), 400
    feedback = ((request.get_json(silent=True) or {}).get("feedback") or "").strip()
    if not feedback:
        return jsonify({"message": "Escribe una retroalimentación para el estudiante."}), 400
    attempt.status = "FAILED_REVIEWED"
    attempt.feedback = feedback
    attempt.reviewed_at = datetime.now(timezone.utc)
    attempt.reviewed_by_id = uuid.UUID(get_jwt_identity())
    enrollment = attempt.enrollment
    enrollment.teacher_feedback = feedback
    enrollment.reviewed_at = attempt.reviewed_at
    db.session.commit()
    exam = enrollment.course.final_exam
    attempts_remaining = max(0, exam.attempts_allowed - len(enrollment.exam_attempts))
    continuation = (
        f"Ya está habilitado tu siguiente intento. Te quedan <strong>{attempts_remaining}</strong> intento(s)."
        if attempts_remaining
        else "Has utilizado todos los intentos disponibles. Comunícate con la academia para recibir orientación."
    )
    safe_send(
        enrollment.student.email,
        "Retroalimentación de tu examen final — Alianza Contigo",
        branded_html(
            "Tu examen final no fue aprobado",
            f"Hola {escape(enrollment.student.first_name)},",
            f"El docente revisó tu intento {attempt.attempt_number} del curso <strong>{escape(enrollment.course.name)}</strong>.<br><br><strong>Retroalimentación:</strong> {escape(feedback)}<br><br>{continuation}",
            "Volver al examen" if attempts_remaining else None,
            f'{current_app.config["FRONTEND_URL"]}/app/exam/{enrollment.course.slug}' if attempts_remaining else None,
        ),
    )
    return jsonify({"message": "Retroalimentación enviada al estudiante.", "attemptsRemaining": attempts_remaining})
