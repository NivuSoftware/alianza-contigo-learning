from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True, slots=True)
class Course:
    id: UUID
    slug: str
    name: str
    short_description: str
    full_description: str
    cover_url: str | None
    modality: str
    duration: str
    certification: str
    endorsement: str
    price: float
    discount_percent: int
    status: str
