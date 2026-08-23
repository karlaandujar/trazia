from uuid import UUID
from fastapi import FastAPI, File, UploadFile, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from database import get_courses, create_course, get_course_by_id, get_user, upload_assignments, get_assignments, create_assignment
from models import CourseCreate, AssignmentCreate, BulkAssignmentCreate
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
def read_assignments(request: Request, assignment_type: str | None = None):
    user_id = get_current_user(request)
    return get_assignments(user_id, assignment_type)

# Endpoint for POST method to assignments table (ex. adding an assignment)
@app.post("/singularAssignment")
def add_assignment(assignment: AssignmentCreate):
    return create_assignment(assignment)

# Endpoint for POST method to assignments table with multiple assignments
@app.post("/bulkAssignments")
def add_assignments(request: Request, bulk_data: BulkAssignmentCreate):
    user_id = get_current_user(request)
    # Get valid course that the assignments belong to
    course = get_course_by_id(bulk_data.course_id, user_id)
    if (course is None):
        raise HTTPException(
            status_code=404,
            detail="Null course"
        )

    # Now upload all the assignments
    return upload_assignments(bulk_data.course_id, bulk_data.assignments, bulk_data.timezone)

# Endpoint for reading courses
@app.get("/courses")
def read_courses(request: Request):
    user_id = get_current_user(request)
    return get_courses(user_id)

# Endpoint for POST method to courses table (ex. adding a course)
@app.post("/courses")
def add_course(request: Request, course: CourseCreate):
    user_id = get_current_user(request)
    return create_course(course, user_id)

# Function to extract text from a PDF file
def read_pdf(file: UploadFile):
    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

# Endpoint for getting the assignments via an upload in the add assignments card (optional file and text since only one is uploaded)
@app.post("/uploadAssignments/")
async def upload_schedule(request: Request, file: UploadFile | None = File(None), pastedText: str | None = Form(None), course_id: UUID = Form(...)):
    user_id = get_current_user(request)
    # Get valid course that the assignments belong to
    course = get_course_by_id(course_id, user_id)
    if (course is None):
        raise HTTPException(
            status_code=404,
            detail="Null course"
        )

    # Verify that either but not none or both file and text are uploaded
    if file is None and pastedText is None: 
        raise HTTPException(
            status_code=400,
            detail="Provide a file or a pasted text."
        )
    if file is not None and pastedText is not None:
        raise HTTPException(
            status_code=400,
            detail="Please only provide either a file or a pasted text, not both."
        )

    # Extract from file if a file was provided
    if file is not None:
        text = read_pdf(file)
        assignments = get_assignments_from_sched(text)

    # Otherwise extract from text since text was provided
    else: 
        assignments = get_assignments_from_sched(pastedText)

    return assignments
