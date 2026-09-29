from app import create_app
from app.extensions import db
from app.infrastructure.persistence.models import CourseModel, TrainingAreaModel


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ["http://localhost:5173"]
    FRONTEND_URL = "https://alianzacontigoeducacion.com"
    JWT_SECRET_KEY = "test-secret-key-with-enough-length-123"


def make_client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        area = TrainingAreaModel(name="Gestión")
        db.session.add_all([
            CourseModel(training_area=area, slug="curso-activo", name="Curso Activo & Práctico", short_description="Aprende gestión.", modality="Virtual", duration="40 horas", certification="Certificado", price=100, discount_percent=10, status="ACTIVO", cover_url="/api/v1/uploads/portada.jpg"),
            CourseModel(training_area=area, slug="curso-cerrado", name="Curso Cerrado", short_description="Oculto.", modality="Virtual", duration="10 horas", certification="Certificado", price=50, status="CERRADO"),
        ])
        db.session.commit()
    return app.test_client()


def test_sitemap_lists_public_pages_and_active_courses_only():
    response = make_client().get("/api/v1/seo/sitemap.xml")
    assert response.status_code == 200
    assert response.mimetype == "application/xml"
    body = response.get_data(as_text=True)
    assert "<loc>https://alianzacontigoeducacion.com/</loc>" in body
    assert "https://alianzacontigoeducacion.com/courses/curso-activo" in body
    assert "https://alianzacontigoeducacion.com/api/v1/uploads/portada.jpg" in body
    assert "Curso Activo &amp; Práctico" in body
    assert "curso-cerrado" not in body


def test_llms_txt_describes_brand_and_courses():
    response = make_client().get("/api/v1/seo/llms.txt")
    assert response.status_code == 200
    body = response.get_data(as_text=True)
    assert body.startswith("# Alianza Contigo Educación Continua")
    assert "educación en línea" in body
    assert "[Curso Activo & Práctico](https://alianzacontigoeducacion.com/courses/curso-activo)" in body
    assert "USD 90.00" in body
    assert "Curso Cerrado" not in body
