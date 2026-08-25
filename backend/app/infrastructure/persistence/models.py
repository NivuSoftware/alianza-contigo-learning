import uuid
from datetime import datetime, timezone

from app.extensions import db


class CourseModel(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Uuid, primary_key=True, default=uuid.uuid4)
    slug = db.Column(db.String(160), nullable=False, unique=True, index=True)
    name = db.Column(db.String(180), nullable=False)
    short_description = db.Column(db.Text, nullable=False)
    modality = db.Column(db.String(120), nullable=False)
    duration = db.Column(db.String(80), nullable=False)
    certification = db.Column(db.String(180), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="Activo")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
