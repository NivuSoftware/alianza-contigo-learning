import os
import uuid
from html import escape
from datetime import datetime, timezone
from decimal import Decimal

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity
from sqlalchemy import func
from werkzeug.utils import secure_filename

from app.extensions import db
from app.infrastructure.email_service import branded_html, send_html
from app.infrastructure.persistence.models import CourseModel, EnrollmentModel, PaymentOrderModel, UserModel
from app.presentation.auth_api import role_required

payment_api = Blueprint("payments", __name__)
PROOF_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp"}


def current_user():
    return db.session.get(UserModel, uuid.UUID(get_jwt_identity()))


def final_price(course):
    return (course.price * Decimal(100 - course.discount_percent) / Decimal(100)).quantize(Decimal("0.01"))


def serialize_order(order):
    return {"id": str(order.id), "reference": order.reference, "courseName": order.course.name, "courseSlug": order.course.slug, "studentName": f"{order.student.first_name} {order.student.last_name}", "studentEmail": order.student.email, "paymentMethod": order.payment_method, "provider": order.provider, "providerTransactionId": order.provider_transaction_id, "currency": order.currency, "amount": float(order.amount), "status": order.status, "proofUrl": order.proof_url, "rejectionComment": order.rejection_comment, "createdAt": order.created_at.isoformat(), "paidAt": order.paid_at.isoformat() if order.paid_at else None}


def ensure_available(course_slug, student):
    course = CourseModel.query.filter_by(slug=course_slug, status="ACTIVO").first()
    if not course:
        return None, (jsonify({"message": "Este curso no está disponible."}), 404)
    if EnrollmentModel.query.filter_by(course_id=course.id, student_id=student.id).first():
        return None, (jsonify({"message": "Ya tienes acceso a este curso."}), 409)
    pending = PaymentOrderModel.query.filter_by(course_id=course.id, student_id=student.id, status="PENDING").first()
    if pending:
        return None, (jsonify({"message": "Ya tienes una transferencia pendiente de validación."}), 409)
    return course, None


def enroll(course, student):
    enrollment = EnrollmentModel.query.filter_by(course_id=course.id, student_id=student.id).first()
    if not enrollment:
        enrollment = EnrollmentModel(course_id=course.id, student_id=student.id)
        db.session.add(enrollment)
    return enrollment


def safe_send(to, subject, html):
    try:
        send_html(to, subject, html)
    except Exception:
        current_app.logger.exception("No se pudo enviar el correo %s", subject)


def clean(value):
    return escape(str(value or ""))


@payment_api.get("/bank-details")
@role_required("student")
def bank_details():
    return jsonify({"bank": current_app.config["BANK_NAME"], "accountType": current_app.config["BANK_ACCOUNT_TYPE"], "accountNumber": current_app.config["BANK_ACCOUNT_NUMBER"], "holder": current_app.config["BANK_ACCOUNT_HOLDER"], "holderId": current_app.config["BANK_ACCOUNT_ID"]})


@payment_api.post("/card")
@role_required("student")
def card_checkout():
    student = current_user()
    data = request.get_json(silent=True) or {}
    course, failure = ensure_available(data.get("courseSlug"), student)
    if failure:
        return failure
    digits = "".join(char for char in str(data.get("cardNumber", "")) if char.isdigit())
    if len(digits) < 13 or len(str(data.get("cvv", ""))) < 3 or not data.get("cardholder"):
        return jsonify({"message": "Completa correctamente los datos de la tarjeta."}), 400
    paid_at = datetime.now(timezone.utc)
    order = PaymentOrderModel(reference=f"CARD-{uuid.uuid4().hex[:10].upper()}", course=course, student=student, payment_method="CARD", provider="SIMULATED", currency="USD", amount=final_price(course), status="APPROVED", reviewed_at=paid_at, paid_at=paid_at)
    db.session.add(order)
    enroll(course, student)
    db.session.commit()
    safe_send(student.email, "Tu inscripción está activa — Alianza Contigo", branded_html("¡Pago aprobado!", f"Hola {clean(student.first_name)},", f"Tu pago de <strong>${order.amount}</strong> para <strong>{clean(course.name)}</strong> fue aprobado. Ya puedes comenzar a estudiar.", "Ir a mi curso", f'{current_app.config["FRONTEND_URL"]}/app/classroom/{course.slug}'))
    return jsonify({"message": "Pago simulado aprobado. Ya tienes acceso al curso.", "reference": order.reference, "redirect": f"/app/classroom/{course.slug}"}), 201


@payment_api.post("/transfer")
@role_required("student")
def transfer_checkout():
    student = current_user()
    course, failure = ensure_available(request.form.get("courseSlug"), student)
    if failure:
        return failure
    proof = request.files.get("proof")
    if not proof or not proof.filename:
        return jsonify({"message": "Carga el comprobante de transferencia."}), 400
    extension = proof.filename.rsplit(".", 1)[-1].lower() if "." in proof.filename else ""
    if extension not in PROOF_EXTENSIONS:
        return jsonify({"message": "El comprobante debe ser PDF, JPG, PNG o WebP."}), 400
    os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
    filename = f"proof-{uuid.uuid4().hex}-{secure_filename(proof.filename)}"
    proof.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
    order = PaymentOrderModel(reference=f"TRF-{uuid.uuid4().hex[:10].upper()}", course=course, student=student, payment_method="TRANSFER", provider="BANK_TRANSFER", currency="USD", amount=final_price(course), status="PENDING", proof_url=f"/api/v1/uploads/{filename}")
    db.session.add(order)
    db.session.commit()
    safe_send(current_app.config["MAIL_RECIPIENT"], f"Transferencia por validar · {order.reference}", branded_html("Nuevo comprobante por validar", "Hola equipo administrativo,", f"<strong>{clean(student.first_name)} {clean(student.last_name)}</strong> registró una transferencia de <strong>${order.amount}</strong> para <strong>{clean(course.name)}</strong>.<br>Referencia: {order.reference}", "Validar comprobante", f'{current_app.config["FRONTEND_URL"]}/admin/enrollments'))
    safe_send(student.email, "Reserva registrada — Alianza Contigo", branded_html("Recibimos tu comprobante", f"Hola {clean(student.first_name)},", f"Registramos tu reserva para <strong>{clean(course.name)}</strong>. Administración validará el pago en un plazo máximo de 24 horas. Te notificaremos cuando puedas empezar a estudiar.<br>Referencia: {order.reference}"))
    return jsonify({"message": "Comprobante recibido. Validaremos tu pago en un plazo máximo de 24 horas.", "reference": order.reference}), 201


@payment_api.get("/orders")
@role_required("admin")
def list_orders():
    status = request.args.get("status")
    query = PaymentOrderModel.query
    if status in {"PENDING", "APPROVED", "REJECTED"}:
        query = query.filter_by(status=status)
    return jsonify({"orders": [serialize_order(order) for order in query.order_by(PaymentOrderModel.created_at.desc()).all()]})


@payment_api.get("/admin/summary")
@role_required("admin")
def payment_summary():
    def total_for(status):
        value = (
            db.session.query(func.coalesce(func.sum(PaymentOrderModel.amount), 0))
            .filter(PaymentOrderModel.status == status)
            .scalar()
        )
        return float(value)

    counts = {
        status: PaymentOrderModel.query.filter_by(status=status).count()
        for status in ("PENDING", "APPROVED", "REJECTED")
    }
    methods = (
        db.session.query(
            PaymentOrderModel.payment_method,
            func.count(PaymentOrderModel.id),
            func.coalesce(func.sum(PaymentOrderModel.amount), 0),
        )
        .filter(PaymentOrderModel.status == "APPROVED")
        .group_by(PaymentOrderModel.payment_method)
        .all()
    )
    payphone_configured = bool(
        current_app.config.get("PAYPHONE_STORE_ID") and current_app.config.get("PAYPHONE_TOKEN")
    )
    return jsonify(
        {
            "receivedTotal": total_for("APPROVED"),
            "pendingTotal": total_for("PENDING"),
            "approvedCount": counts["APPROVED"],
            "pendingCount": counts["PENDING"],
            "rejectedCount": counts["REJECTED"],
            "byMethod": [
                {"method": method, "count": count, "total": float(total)}
                for method, count, total in methods
            ],
            "payphone": {
                "configured": payphone_configured,
                "status": "READY" if payphone_configured else "PENDING_CONFIGURATION",
            },
        }
    )


@payment_api.patch("/orders/<order_id>")
@role_required("admin")
def review_order(order_id):
    order = db.session.get(PaymentOrderModel, uuid.UUID(order_id))
    if not order or order.status != "PENDING":
        return jsonify({"message": "Este pedido ya fue procesado o no existe."}), 400
    data = request.get_json(silent=True) or {}
    decision = data.get("decision")
    if decision == "approve":
        order.status = "APPROVED"
        order.paid_at = datetime.now(timezone.utc)
        enroll(order.course, order.student)
        subject = "Pago aprobado — Ya puedes comenzar"
        html = branded_html("¡Tu pago fue aprobado!", f"Hola {clean(order.student.first_name)},", f"Tu transferencia para <strong>{clean(order.course.name)}</strong> fue validada. El curso ya está disponible en tu portal.", "Comenzar curso", f'{current_app.config["FRONTEND_URL"]}/app/classroom/{order.course.slug}')
    elif decision == "reject":
        comment = (data.get("comment") or "").strip()
        if not comment:
            return jsonify({"message": "Escribe el motivo del rechazo."}), 400
        order.status = "REJECTED"
        order.rejection_comment = comment
        subject = "Comprobante rechazado — Alianza Contigo"
        html = branded_html("No pudimos validar tu comprobante", f"Hola {clean(order.student.first_name)},", f"El comprobante para <strong>{clean(order.course.name)}</strong> fue rechazado.<br><br><strong>Motivo:</strong> {clean(comment)}<br><br>Puedes realizar una nueva transferencia y cargar un comprobante legible.")
    else:
        return jsonify({"message": "Decisión no válida."}), 400
    order.reviewed_at = datetime.now(timezone.utc)
    db.session.commit()
    safe_send(order.student.email, subject, html)
    return jsonify(serialize_order(order))
