from pydantic import BaseModel
from datetime import datetime
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
    due_date: datetime
    points: int
    weight: int | None = None
    course_id: UUID

class BulkAssignmentCreate(BaseModel):
    course_id: UUID
    timezone: str
    assignments: list[ExtractedAssignment]

# Separate model for extracted assignment since may contain many nulls
class ExtractedAssignment(BaseModel):
    title: str
    type: str | None = None
    due_date: datetime | None = None
    points: int | None = None
    weight: int | None = None
