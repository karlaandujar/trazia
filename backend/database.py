import os
from supabase import create_client, Client
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Access the variables
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def get_user(token):
    return supabase.auth.get_user(token)

def get_courses(user_id):
    response = supabase.table("courses").select("*").eq("user_id", user_id).execute()
    courses = response.data
    return courses

def get_course_by_id(course_id: int):
    response = supabase.table("courses").select("*").eq("id", course_id).execute()
    course = response.data
    if course:
        return course[0]  # Return the first (and only) course found
    else:
        return None  # Return None if no course is found with the given ID

def create_course(course_name: str, course_number: str):
    if not course_name.strip() or not course_number.strip():
        raise ValueError("Course name and course number cannot be empty.")
    response = supabase.table("courses").insert({
        "course_name": course_name,
        "course_number": course_number
    }).execute()
    return response.data

#have an upload_assignments func to upload everything into the assignments table but just store course id and asisngment