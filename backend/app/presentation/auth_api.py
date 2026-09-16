import re
import uuid
from datetime import datetime, timezone
from functools import wraps
from html import escape

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token, decode_token, get_jwt,
    get_jwt_identity, jwt_required, set_access_cookies, set_refresh_cookies,
    unset_jwt_cookies,
)

from app.extensions import db
from app.infrastructure.email_service import branded_html, send_html
from app.infrastructure.persistence.models import UserModel

auth_api = Blueprint("auth", __name__)
ROLES = {"admin", "teacher", "student"}


def error(message, status=400, code="invalid_request"):
    return jsonify({"error": code, "message": message}), status


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapped(*args, **kwargs):
            if get_jwt().get("role") not in roles:
                return error("No tienes permisos para realizar esta acción.", 403, "forbidden")
            return fn(*args, **kwargs)
        return wrapped
    return decorator


def password_is_valid(password):
    return len(password or "") >= 8 and bool(re.search(r"[A-Za-z]", password)) and bool(re.search(r"\d", password))


def issue_session(user):
    claims = {"role": user.role}
    response = jsonify({"user": user.to_dict()})
    set_access_cookies(response, create_access_token(identity=str(user.id), additional_claims=claims))
    set_refresh_cookies(response, create_refresh_token(identity=str(user.id), additional_claims=claims))
    return response


@auth_api.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not all((data.get("firstName"), data.get("lastName"), email, data.get("password"))):
        return error("Completa todos los campos obligatorios.")
    if not password_is_valid(data["password"]):
        return error("La contraseña debe tener al menos 8 caracteres, una letra y un número.")
    if UserModel.query.filter_by(email=email).first():
        return error("Ya existe una cuenta con este correo.", 409, "email_exists")
    user = UserModel(first_name=data["firstName"].strip(), last_name=data["lastName"].strip(), email=email,
                     role="student", national_id=(data.get("nationalId") or None), phone=(data.get("phone") or None))
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return issue_session(user), 201


@auth_api.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    user = UserModel.query.filter_by(email=email).first()
    if not user or not user.check_password(data.get("password") or ""):
        return error("Correo o contraseña incorrectos.", 401, "invalid_credentials")
    if not user.is_active:
        return error("Esta cuenta se encuentra desactivada.", 403, "inactive_account")
    requested_role = data.get("role")
    if requested_role and user.role != requested_role:
        return error("Esta cuenta no tiene acceso a este portal.", 403, "wrong_portal")
    user.last_login_at = datetime.now(timezone.utc)
    db.session.commit()
    return issue_session(user)


@auth_api.get("/me")
@jwt_required()
def me():
    user = db.session.get(UserModel, uuid.UUID(get_jwt_identity()))
    if not user or not user.is_active:
        return error("Sesión no disponible.", 401, "session_invalid")
    return jsonify({"user": user.to_dict()})


@auth_api.patch("/profile")
@role_required("student", "teacher", "admin")
def update_profile():
    user = db.session.get(UserModel, uuid.UUID(get_jwt_identity()))
    data = request.get_json(silent=True) or {}
    if "firstName" in data and data["firstName"].strip():
        user.first_name = data["firstName"].strip()
    if "lastName" in data and data["lastName"].strip():
        user.last_name = data["lastName"].strip()
    if "phone" in data:
        user.phone = data["phone"].strip() or None
    if data.get("avatarKey") in {"navy", "gold", "emerald", "plum"}:
        user.avatar_key = data["avatarKey"]
    db.session.commit()
    return jsonify({"user": user.to_dict()})


@auth_api.post("/change-password")
@role_required("student", "teacher", "admin")
def change_password():
    user = db.session.get(UserModel, uuid.UUID(get_jwt_identity()))
    data = request.get_json(silent=True) or {}
    if not user.check_password(data.get("currentPassword") or ""):
        return error("La contraseña actual es incorrecta.", 400, "wrong_password")
    if not password_is_valid(data.get("newPassword")):
        return error("La nueva contraseña debe tener al menos 8 caracteres, una letra y un número.")
    user.set_password(data["newPassword"])
    db.session.commit()
    return jsonify({"message": "Contraseña actualizada correctamente."})


@auth_api.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user = db.session.get(UserModel, uuid.UUID(get_jwt_identity()))
    if not user or not user.is_active:
        return error("Sesión no disponible.", 401, "session_invalid")
    response = jsonify({"user": user.to_dict()})
    set_access_cookies(response, create_access_token(identity=str(user.id), additional_claims={"role": user.role}))
    return response


@auth_api.post("/logout")
def logout():
    response = jsonify({"message": "Sesión cerrada."})
    unset_jwt_cookies(response)
    return response


def send_reset_email(user, token):
    link = f'{current_app.config["FRONTEND_URL"]}/restablecer-contrasena?token={token}'
    html = branded_html(
        "Restablece tu contraseña",
        f"Hola {escape(user.first_name)},",
        "Recibimos una solicitud para cambiar la contraseña de tu cuenta. Usa el botón para crear una nueva. "
        "<div style='margin-top:20px;padding:16px 18px;background:#F7F8FA;border-left:3px solid #C89432;border-radius:6px;color:#405168;font-size:13px'>"
        "Este enlace vence en <strong>30 minutos</strong>. Si no solicitaste el cambio, puedes ignorar este correo; tu contraseña seguirá igual.</div>",
        "Crear nueva contraseña",
        link,
    )
    return send_html(user.email, "Restablece tu contraseña — Alianza Contigo", html)


@auth_api.post("/forgot-password")
def forgot_password():
    email = ((request.get_json(silent=True) or {}).get("email") or "").strip().lower()
    user = UserModel.query.filter_by(email=email, is_active=True).first()
    if user:
        token = create_access_token(identity=str(user.id), additional_claims={"purpose": "password_reset"}, expires_delta=__import__("datetime").timedelta(minutes=30))
        try:
            send_reset_email(user, token)
        except Exception:
            current_app.logger.exception("No se pudo enviar el correo de recuperación")
    return jsonify({"message": "Si el correo está registrado, recibirás un enlace de recuperación."})


@auth_api.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    if not password_is_valid(data.get("password")):
        return error("La contraseña debe tener al menos 8 caracteres, una letra y un número.")
    try:
        decoded = decode_token(data.get("token") or "")
    except Exception:
        return error("El enlace es inválido o venció.", 400, "invalid_token")
    if decoded.get("purpose") != "password_reset":
        return error("El enlace no es válido.", 400, "invalid_token")
    user = db.session.get(UserModel, uuid.UUID(decoded["sub"]))
    if not user:
        return error("El enlace no es válido.", 400, "invalid_token")
    user.set_password(data["password"])
    db.session.commit()
    return jsonify({"message": "Contraseña actualizada correctamente."})


@auth_api.get("/users")
@role_required("admin")
def users():
    role = request.args.get("role")
    query = UserModel.query
    if role in ROLES:
        query = query.filter_by(role=role)
    return jsonify({"users": [user.to_dict() for user in query.order_by(UserModel.created_at.desc()).all()]})


@auth_api.post("/teachers")
@role_required("admin")
def create_teacher():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not all((data.get("firstName"), data.get("lastName"), email, data.get("password"))):
        return error("Completa todos los campos obligatorios.")
    if not password_is_valid(data["password"]):
        return error("La contraseña debe tener al menos 8 caracteres, una letra y un número.")
    if UserModel.query.filter_by(email=email).first():
        return error("Ya existe una cuenta con este correo.", 409, "email_exists")
    user = UserModel(first_name=data["firstName"].strip(), last_name=data["lastName"].strip(), email=email, role="teacher", phone=data.get("phone"))
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"user": user.to_dict()}), 201
