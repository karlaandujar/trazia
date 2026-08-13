from pydantic import BaseModel


class CourseCreate(BaseModel):
    course_name: str
    course_number: str
    subject: str