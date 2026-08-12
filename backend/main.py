from uuid import UUID
from fastapi import FastAPI, UploadFile, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from database import get_courses, create_course, get_course_by_id, get_user, upload_assignments, get_assignments
from models import CourseCreate
from ai import get_assignments_from_sched

app = FastAPI()
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://traziadeployment.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to get the current user id
def get_current_user(request: Request):
    token = request.headers.get("Authorization")
    if (token is None): 
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    clean_token = token[7:]
    return get_user(clean_token).user.id

# Endpoint for backend
@app.get("/")
def root():
    return {"message": "Trazia backend is running."}

# Endpoint for reading assignments
@app.get("/assignments")
def read_assignments(request: Request):
    user_id = get_current_user(request)
    return get_assignments(user_id)

# Endpoint for reading courses
@app.get("/courses")
def read_courses(request: Request):
    user_id = get_current_user(request)
    return get_courses(user_id)

# Endpoint for POST method to courses table (ex. adding a course)
@app.post("/courses")
def add_course(request: Request, course: CourseCreate):
    user_id = get_current_user(request)
    return create_course(course.course_name, course.course_number, user_id)

# Function to extract text from a PDF file
def read_pdf(file: UploadFile):
    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

# Endpoint for uploading a PDF file
@app.post("/upload/")
async def upload_schedule(request: Request, file: UploadFile, course_id: UUID = Form(...)):
    user_id = get_current_user(request)
    text = read_pdf(file)
    # Get valid course that the assignments belong to
    course = get_course_by_id(course_id, user_id)
    if (course is None):
        raise HTTPException(
            status_code=404,
            detail="Null course"
        )

    assignments = get_assignments_from_sched(text)
    upload_assignments(course_id, assignments)
    return "Upload schedule success"
