from flask import Flask

from app.config import get_config
from app.extensions import cors, db, migrate
from app.infrastructure.persistence.models import CourseModel
from app.infrastructure.persistence.repositories import SqlAlchemyCourseRepository
from app.presentation.api import create_api_blueprint
from app.application.services.course_service import CourseService


def create_app(config_object=None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object or get_config())

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    repository = SqlAlchemyCourseRepository(db.session, CourseModel)
    course_service = CourseService(repository)
    app.register_blueprint(create_api_blueprint(course_service), url_prefix="/api/v1")

    return app
