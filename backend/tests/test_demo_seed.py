from app import create_app
from app.extensions import db
from app.infrastructure.demo_seed import seed_demo_courses
from app.infrastructure.persistence.models import CourseModel


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ["http://localhost:5173"]


def test_demo_seed_is_complete_and_idempotent():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        assert seed_demo_courses() == 3
        assert seed_demo_courses() == 3
        courses = CourseModel.query.order_by(CourseModel.slug).all()
        assert len(courses) == 3
        for course in courses:
            assert course.status == "ACTIVO"
            assert len(course.modules) == 2
            assert sum(len(module.lessons) for module in course.modules) == 4
            assert course.final_exam is not None
            assert len(course.final_exam.questions) == 5
            assert sum(question.points for question in course.final_exam.questions) == 100
