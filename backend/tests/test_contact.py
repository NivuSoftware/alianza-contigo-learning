from unittest.mock import patch

from app import create_app
from app.extensions import db
from app.infrastructure.persistence.models import CourseModel


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ["http://localhost:5173"]
    MAIL_RECIPIENT = "admisiones@example.com"


def make_client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        db.session.add(CourseModel(
            slug="liderazgo",
            name="Liderazgo",
            short_description="Programa de liderazgo",
            modality="Virtual",
            duration="20 horas",
            certification="Certificado de aprobación",
            status="ACTIVO",
        ))
        db.session.commit()
    return app.test_client()


@patch("app.presentation.api.send_html", return_value=True)
def test_contact_sends_branded_email(send_html_mock):
    response = make_client().post("/api/v1/contact", json={
        "courseSlug": "liderazgo",
        "name": "Ana Pérez",
        "email": "ana@example.com",
        "phone": "+593 999 000 000",
        "message": "Quiero fortalecer mis habilidades.",
    })

    assert response.status_code == 201
    recipient, subject, html = send_html_mock.call_args.args
    assert recipient == "admisiones@example.com"
    assert "Liderazgo" in subject
    assert "ALIANZA" in html
    assert "Ana Pérez" in html


def test_contact_rejects_unknown_course():
    response = make_client().post("/api/v1/contact", json={
        "courseSlug": "inexistente",
        "name": "Ana Pérez",
        "email": "ana@example.com",
        "phone": "+593 999 000 000",
        "message": "Información",
    })

    assert response.status_code == 400
