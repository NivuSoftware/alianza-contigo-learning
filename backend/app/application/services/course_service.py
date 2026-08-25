from app.domain.entities import Course
from app.domain.repositories import CourseRepository


class CourseService:
    def __init__(self, repository: CourseRepository) -> None:
        self._repository = repository

    def list_courses(self) -> list[Course]:
        return self._repository.list()

    def get_course(self, slug: str) -> Course | None:
        return self._repository.get_by_slug(slug)
