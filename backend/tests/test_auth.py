from app import create_app
from app.extensions import db
from app.infrastructure.persistence.models import UserModel


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ["http://localhost:5173"]
    JWT_SECRET_KEY = "test-secret-that-is-at-least-32-characters"
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_COOKIE_SECURE = False


def client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
    return app.test_client()


def test_student_register_login_and_session():
    web = client()
    payload = {"firstName": "Ana", "lastName": "Torres", "email": "ana@example.com", "password": "Seguro123"}
    response = web.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json["user"]["role"] == "student"
    assert web.get("/api/v1/auth/me").status_code == 200
    web.post("/api/v1/auth/logout")
    response = web.post("/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"], "role": "student"})
    assert response.status_code == 200


def test_public_registration_cannot_choose_privileged_role():
    web = client()
    response = web.post("/api/v1/auth/register", json={"firstName": "Eve", "lastName": "Admin", "email": "eve@example.com", "password": "Seguro123", "role": "admin"})
    assert response.json["user"]["role"] == "student"


def test_admin_can_create_and_list_teacher():
    web = client()
    app = web.application
    with app.app_context():
        admin = UserModel(first_name="Admin", last_name="Test", email="admin@example.com", role="admin")
        admin.set_password("Seguro123")
        db.session.add(admin)
        db.session.commit()
    assert web.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "Seguro123", "role": "admin"}).status_code == 200
    response = web.post("/api/v1/auth/teachers", json={"firstName": "Hayland", "lastName": "Montalvo", "email": "teacher@example.com", "phone": "0999567465", "password": "Temporal123"})
    assert response.status_code == 201
    assert response.json["user"]["role"] == "teacher"
    response = web.get("/api/v1/auth/users?role=teacher")
    assert response.status_code == 200
    assert len(response.json["users"]) == 1
