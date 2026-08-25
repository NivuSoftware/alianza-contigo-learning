from app import create_app


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ["http://localhost:5173"]


def test_health():
    client = create_app(TestConfig).test_client()
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json["status"] == "ok"
