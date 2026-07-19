from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_courses

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