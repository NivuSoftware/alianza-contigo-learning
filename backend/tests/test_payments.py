from io import BytesIO
import json
from tempfile import TemporaryDirectory

from app import create_app
from app.extensions import db
from app.infrastructure.persistence.models import (
    CourseModel,
    CourseModuleModel,
    EnrollmentModel,
    ExamQuestionModel,
    FinalExamModel,
    LessonModel,
    PaymentOrderModel,
    UserModel,
)


class PaymentTestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ["http://localhost:5173"]
    JWT_SECRET_KEY = "test-secret-that-is-at-least-32-characters"
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_COOKIE_SECURE = False
    EMAIL_ADDRESS = ""
    EMAIL_PASSWORD = ""
    MAIL_RECIPIENT = ""
    FRONTEND_URL = "http://localhost:5173"
    BANK_NAME = "Banco de prueba"
    BANK_ACCOUNT_TYPE = "Corriente"
    BANK_ACCOUNT_NUMBER = "123456"
    BANK_ACCOUNT_HOLDER = "Alianza Contigo"
    BANK_ACCOUNT_ID = "0999999999"
    PAYPHONE_TOKEN = "test-payphone-token"
    PAYPHONE_STORE_ID = "test-store-id"


def build_client(upload_folder):
    PaymentTestConfig.UPLOAD_FOLDER = upload_folder
    app = create_app(PaymentTestConfig)
    with app.app_context():
        db.create_all()
        student = UserModel(
            first_name="Ana",
            last_name="Torres",
            email="ana@example.com",
            role="student",
        )
        student.set_password("Seguro123")
        admin = UserModel(
            first_name="Admin",
            last_name="General",
            email="admin@example.com",
            role="admin",
        )
        admin.set_password("Seguro123")
        teacher = UserModel(
            first_name="Docente",
            last_name="Prueba",
            email="teacher@example.com",
            role="teacher",
        )
        teacher.set_password("Seguro123")
        db.session.add_all(
            [
                student,
                admin,
                teacher,
                CourseModel(
                    slug="curso-tarjeta",
                    name="Curso tarjeta",
                    short_description="Curso activo",
                    full_description="",
                    modality="Virtual",
                    duration="A tu ritmo",
                    certification="Certificado",
                    endorsement="",
                    price=100,
                    discount_percent=10,
                    status="ACTIVO",
                    modules=[
                        CourseModuleModel(
                            title="Módulo 1",
                            position=0,
                            lessons=[
                                LessonModel(title="Lección 1", lesson_type="text", position=0),
                                LessonModel(title="Lección 2", lesson_type="text", position=1),
                            ],
                        )
                    ],
                    final_exam=FinalExamModel(
                        title="Examen final",
                        passing_score=70,
                        attempts_allowed=2,
                        questions=[
                            ExamQuestionModel(
                                prompt="Pregunta uno",
                                options=["Correcta", "Incorrecta"],
                                correct_answers=[0],
                                points=1,
                                position=0,
                            ),
                            ExamQuestionModel(
                                prompt="Pregunta dos",
                                options=["Correcta", "Incorrecta"],
                                correct_answers=[0],
                                points=1,
                                position=1,
                            ),
                        ],
                    ),
                ),
                CourseModel(
                    slug="curso-transferencia",
                    name="Curso transferencia",
                    short_description="Curso activo",
                    full_description="",
                    modality="Virtual",
                    duration="A tu ritmo",
                    certification="Certificado",
                    endorsement="",
                    price=80,
                    discount_percent=0,
                    status="ACTIVO",
                ),
            ]
        )
        db.session.commit()
    return app.test_client()


def login(web, email, role):
    return web.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Seguro123", "role": role},
    )


def test_card_only_enrolls_after_payphone_confirms(monkeypatch):
    with TemporaryDirectory() as uploads:
        web = build_client(uploads)
        assert login(web, "ana@example.com", "student").status_code == 200
        response = web.post(
            "/api/v1/payments/card",
            json={"courseSlug": "curso-tarjeta"},
        )
        assert response.status_code == 201
        assert response.json["amount"] == 9000
        assert response.json["amountWithoutTax"] == 9000
        reference = response.json["clientTransactionId"]
        with web.application.app_context():
            assert PaymentOrderModel.query.one().status == "PENDING"
            assert EnrollmentModel.query.count() == 0

        class ConfirmResponse:
            def __enter__(self):
                return self

            def __exit__(self, *_):
                return False

            def read(self):
                return json.dumps({"clientTransactionId": reference, "transactionId": 12345, "statusCode": 3, "transactionStatus": "Approved", "amount": 9000, "currency": "USD"}).encode()

        monkeypatch.setattr("app.presentation.payment_api.urlopen", lambda *_args, **_kwargs: ConfirmResponse())
        confirmed = web.post("/api/v1/payments/payphone/confirm", json={"id": 12345, "clientTransactionId": reference})
        assert confirmed.status_code == 200
        assert confirmed.json["status"] == "approved"
        assert confirmed.json["redirect"] == "/app/classroom/curso-tarjeta"
        assert confirmed.json["courseName"] == "Curso tarjeta"
        assert confirmed.json["amount"] == 90.0
        assert confirmed.json["providerTransactionId"] == "12345"
        repeated = web.post("/api/v1/payments/payphone/confirm", json={"id": 12345, "clientTransactionId": reference})
        assert repeated.json["status"] == "approved"
        legacy_return = web.get(f"/api/v1/payments/payphone/return?id=12345&clientTransactionId={reference}")
        assert "/pagar?id=12345" in legacy_return.location
        assert f"clientTransactionId={reference}" in legacy_return.location
        with web.application.app_context():
            order = PaymentOrderModel.query.one()
            assert order.status == "APPROVED"
            assert order.provider_transaction_id == "12345"
            assert EnrollmentModel.query.count() == 1
        enrollments = web.get("/api/v1/student/enrollments")
        assert enrollments.status_code == 200
        assert enrollments.json["enrollments"][0]["course"]["slug"] == "curso-tarjeta"
        enrollment = enrollments.json["enrollments"][0]
        lessons = enrollment["course"]["modules"][0]["lessons"]
        skipped = web.post(
            f'/api/v1/student/enrollments/{enrollment["id"]}/lessons/{lessons[1]["id"]}/complete'
        )
        assert skipped.status_code == 409
        first = web.post(
            f'/api/v1/student/enrollments/{enrollment["id"]}/lessons/{lessons[0]["id"]}/complete'
        )
        assert first.status_code == 200
        assert first.json["progressPercent"] == 45
        second = web.post(
            f'/api/v1/student/enrollments/{enrollment["id"]}/lessons/{lessons[1]["id"]}/complete'
        )
        assert second.status_code == 200
        assert second.json["progressPercent"] == 90
        exam = web.get(f'/api/v1/exams/student/enrollments/{enrollment["id"]}')
        assert exam.status_code == 200
        assert exam.json["state"]["canAttempt"] is True
        questions = exam.json["exam"]["questions"]
        failed = web.post(
            f'/api/v1/exams/student/enrollments/{enrollment["id"]}/submit',
            json={
                "answers": {
                    questions[0]["id"]: 0,
                    questions[1]["id"]: 1,
                }
            },
        )
        assert failed.status_code == 200
        assert failed.json["passed"] is False
        assert "score" not in failed.json
        blocked = web.get(f'/api/v1/exams/student/enrollments/{enrollment["id"]}')
        assert blocked.json["state"]["pendingReview"] is True
        assert blocked.json["state"]["canAttempt"] is False

        web.post("/api/v1/auth/logout")
        assert login(web, "admin@example.com", "admin").status_code == 200
        admin_pending = web.get("/api/v1/exams/teacher/attempts?status=PENDING_REVIEW")
        assert admin_pending.status_code == 200
        assert len(admin_pending.json["attempts"]) == 1
        assert admin_pending.json["attempts"][0]["courseName"] == "Curso tarjeta"
        payment_summary = web.get("/api/v1/payments/admin/summary")
        assert payment_summary.status_code == 200
        assert payment_summary.json["receivedTotal"] == 90.0
        assert payment_summary.json["approvedCount"] == 1
        assert payment_summary.json["payphone"]["status"] == "READY"
        dashboard = web.get("/api/v1/admin/dashboard")
        assert dashboard.status_code == 200
        assert dashboard.json["stats"]["students"] == 1
        assert dashboard.json["stats"]["activeCourses"] == 2
        assert dashboard.json["stats"]["enrollments"] == 1
        assert dashboard.json["stats"]["revenue"] == 90.0
        assert len(dashboard.json["enrollmentsByMonth"]) == 6
        assert dashboard.json["studentsByCourse"]
        assert dashboard.json["recentActivity"]

        web.post("/api/v1/auth/logout")
        assert login(web, "teacher@example.com", "teacher").status_code == 200
        pending = web.get("/api/v1/exams/teacher/attempts?status=PENDING_REVIEW")
        assert pending.status_code == 200
        attempt_id = pending.json["attempts"][0]["id"]
        review = web.patch(
            f"/api/v1/exams/teacher/attempts/{attempt_id}/review",
            json={"feedback": "Repasa la segunda pregunta."},
        )
        assert review.status_code == 200
        assert review.json["attemptsRemaining"] == 1

        web.post("/api/v1/auth/logout")
        assert login(web, "ana@example.com", "student").status_code == 200
        retry = web.get(f'/api/v1/exams/student/enrollments/{enrollment["id"]}')
        assert retry.json["state"]["canAttempt"] is True
        passed = web.post(
            f'/api/v1/exams/student/enrollments/{enrollment["id"]}/submit',
            json={
                "answers": {
                    questions[0]["id"]: 0,
                    questions[1]["id"]: 0,
                }
            },
        )
        assert passed.status_code == 200
        assert passed.json["passed"] is True
        certificates = web.get("/api/v1/exams/student/certificates")
        assert certificates.status_code == 200
        assert len(certificates.json["certificates"]) == 1
        certificate = certificates.json["certificates"][0]
        assert certificate["studentName"] == "Ana Torres"
        assert certificate["courseName"] == "Curso tarjeta"
        assert certificate["score"] == 100.0
        assert certificate["code"].startswith("AC-")
        pdf = web.get(f'/api/v1/exams/student/certificates/{certificate["id"]}/pdf')
        assert pdf.status_code == 200
        assert pdf.mimetype == "application/pdf"
        assert pdf.data.startswith(b"%PDF-")
        assert len(pdf.data) > 3000
        assert passed.json["score"] == 100
        completed = web.get("/api/v1/student/enrollments")
        assert completed.json["enrollments"][0]["progressPercent"] == 100


def test_transfer_only_enrolls_after_admin_approval():
    with TemporaryDirectory() as uploads:
        web = build_client(uploads)
        assert login(web, "ana@example.com", "student").status_code == 200
        response = web.post(
            "/api/v1/payments/transfer",
            data={
                "courseSlug": "curso-transferencia",
                "proof": (BytesIO(b"proof"), "comprobante.pdf"),
            },
            content_type="multipart/form-data",
        )
        assert response.status_code == 201
        with web.application.app_context():
            order = PaymentOrderModel.query.one()
            assert order.status == "PENDING"
            assert EnrollmentModel.query.count() == 0
            order_id = str(order.id)

        web.post("/api/v1/auth/logout")
        assert login(web, "admin@example.com", "admin").status_code == 200
        students = web.get("/api/v1/admin/students")
        assert students.status_code == 200
        assert students.json["students"][0]["email"] == "ana@example.com"
        assert students.json["students"][0]["coursesCount"] == 0
        review = web.patch(
            f"/api/v1/payments/orders/{order_id}",
            json={"decision": "approve"},
        )
        assert review.status_code == 200
        assert review.json["status"] == "APPROVED"
        with web.application.app_context():
            assert EnrollmentModel.query.count() == 1
        detail = web.get(f'/api/v1/admin/students/{students.json["students"][0]["id"]}')
        assert detail.status_code == 200
        assert detail.json["enrollments"][0]["course"]["slug"] == "curso-transferencia"


def test_payphone_never_enrolls_for_wrong_amount_or_cancelled_payment(monkeypatch):
    with TemporaryDirectory() as uploads:
        web = build_client(uploads)
        assert login(web, "ana@example.com", "student").status_code == 200
        reference = web.post("/api/v1/payments/card", json={"courseSlug": "curso-tarjeta"}).json["clientTransactionId"]

        class ConfirmResponse:
            def __init__(self, details):
                self.details = details

            def __enter__(self):
                return self

            def __exit__(self, *_):
                return False

            def read(self):
                return json.dumps(self.details).encode()

        common = {"clientTransactionId": reference, "transactionId": 777, "currency": "USD"}
        wrong_amount = {**common, "statusCode": 3, "transactionStatus": "Approved", "amount": 100}
        monkeypatch.setattr("app.presentation.payment_api.urlopen", lambda *_args, **_kwargs: ConfirmResponse(wrong_amount))
        mismatch = web.post("/api/v1/payments/payphone/confirm", json={"id": 777, "clientTransactionId": reference})
        assert mismatch.status_code == 502
        with web.application.app_context():
            assert PaymentOrderModel.query.one().status == "PENDING"
            assert EnrollmentModel.query.count() == 0

        cancelled = {**common, "statusCode": 2, "transactionStatus": "Canceled", "amount": 9000}
        monkeypatch.setattr("app.presentation.payment_api.urlopen", lambda *_args, **_kwargs: ConfirmResponse(cancelled))
        rejected = web.post("/api/v1/payments/payphone/confirm", json={"id": 777, "clientTransactionId": reference})
        assert rejected.json["status"] == "rejected"
        with web.application.app_context():
            assert PaymentOrderModel.query.one().status == "REJECTED"
            assert EnrollmentModel.query.count() == 0
