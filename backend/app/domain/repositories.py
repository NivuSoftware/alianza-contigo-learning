from abc import ABC, abstractmethod

from app.domain.entities import Course


class CourseRepository(ABC):
    @abstractmethod
    def list(self) -> list[Course]:
        raise NotImplementedError

    @abstractmethod
    def get_by_slug(self, slug: str) -> Course | None:
        raise NotImplementedError
