from flask import Flask, jsonify
import os

from app.config import get_config
from app.extensions import cors, db, jwt, migrate
from app.infrastructure.persistence.models import CourseModel, UserModel
from app.infrastructure.persistence.repositories import SqlAlchemyCourseRepository
from app.presentation.api import create_api_blueprint
from app.application.services.course_service import CourseService
from app.presentation.auth_api import auth_api
from app.presentation.payment_api import payment_api
from app.presentation.exam_api import exam_api


def create_app(config_object=None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object or get_config())

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"error": "invalid_token", "message": "La sesión no es válida. Inicia sesión nuevamente."}), 401

    @jwt.expired_token_loader
    def expired_token(_header, _payload):
        return jsonify({"error": "token_expired", "message": "La sesión venció."}), 401

    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify({"error": "session_required", "message": "Debes iniciar sesión para continuar."}), 401

    @app.errorhandler(413)
    def upload_too_large(_error):
        return jsonify({"message": "El archivo supera el tamaño máximo permitido."}), 413
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)

    repository = SqlAlchemyCourseRepository(db.session, CourseModel)
    course_service = CourseService(repository)
    app.register_blueprint(create_api_blueprint(course_service), url_prefix="/api/v1")
    app.register_blueprint(auth_api, url_prefix="/api/v1/auth")
    app.register_blueprint(payment_api, url_prefix="/api/v1/payments")
    app.register_blueprint(exam_api, url_prefix="/api/v1/exams")

    @app.cli.command("create-admin")
    def create_admin():
        """Create the initial administrator from environment variables."""
        email = os.getenv("ADMIN_EMAIL", "").strip().lower()
        password = os.getenv("ADMIN_PASSWORD", "")
        if not email or len(password) < 8:
            raise SystemExit("Define ADMIN_EMAIL and ADMIN_PASSWORD (minimum 8 characters).")
        if UserModel.query.filter_by(email=email).first():
            print(f"Administrator {email} already exists.")
            return
        user = UserModel(first_name=os.getenv("ADMIN_FIRST_NAME", "Administrador"), last_name=os.getenv("ADMIN_LAST_NAME", "General"), email=email, role="admin")
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        print(f"Administrator {email} created.")

    return app
