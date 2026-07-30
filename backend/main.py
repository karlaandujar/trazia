from uuid import UUID
from fastapi import FastAPI, UploadFile, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from database import get_courses, create_course, get_course_by_id, get_user
from models import CourseCreate
from ai import get_assignments

app = FastAPI()
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/courses")
def read_courses(request: Request):
    token = request.headers.get("Authorization")
    if (token is None): 
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    clean_token = token[7:]
    user_id = get_user(clean_token).user.id

    return get_courses(user_id)

@app.post("/courses")
def add_course(course: CourseCreate):
    return create_course(course.course_name, course.course_number)

# Function to extract text from a PDF file
def read_pdf(file: UploadFile):
    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

@app.post("/upload/")
async def upload_schedule(file: UploadFile, course_id: UUID = Form(...)):
    text = read_pdf(file)
    course = get_course_by_id(course_id)
    print(get_assignments(text))
    print("COURSE ", course)
    print("COURSE ID ", course_id)
