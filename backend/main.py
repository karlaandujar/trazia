from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_courses
from database import create_course
from models import CourseCreate

app = FastAPI()
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/courses")
def read_courses():
    return get_courses()

@app.post("/courses")
def add_course(course: CourseCreate):
    return create_course(course.course_name, course.course_number)