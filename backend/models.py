from pydantic import BaseModel
from uuid import UUID


class CourseCreate(BaseModel):
    course_name: str
    course_number: str
    subject: str | None = None
    prof: str | None = None
    email: str | None = None
    office_hours: str | None = None
    loc: str | None = None
    time: str | None = None

class AssignmentCreate(BaseModel):
    title: str
    type: str
    due_date: str
    points: int
    weight: int | None = None
    course_id: UUID
