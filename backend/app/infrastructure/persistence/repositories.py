from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import scoped_session

from app.domain.entities import Course
from app.domain.repositories import CourseRepository


class SqlAlchemyCourseRepository(CourseRepository):
    def __init__(self, session: scoped_session, model: type[Any]) -> None:
        self._session = session
        self._model = model

    def list(self) -> list[Course]:
        rows = self._session.scalars(select(self._model).order_by(self._model.name)).all()
        return [self._to_entity(row) for row in rows]

    def get_by_slug(self, slug: str) -> Course | None:
        row = self._session.scalar(select(self._model).where(self._model.slug == slug))
        return self._to_entity(row) if row else None

    @staticmethod
    def _to_entity(row: Any) -> Course:
        return Course(
            id=row.id,
            slug=row.slug,
            name=row.name,
            short_description=row.short_description,
            modality=row.modality,
            duration=row.duration,
            certification=row.certification,
            status=row.status,
        )
