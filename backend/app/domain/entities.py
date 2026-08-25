from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True, slots=True)
class Course:
    id: UUID
    slug: str
    name: str
    short_description: str
    modality: str
    duration: str
    certification: str
    status: str
