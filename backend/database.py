import os
from supabase import create_client, Client
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Access the variables
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def get_courses():
    response = supabase.table("courses").select("*").execute()
    courses = response.data
    return courses

def create_course(course_name: str, course_number: str):
    response = supabase.table("courses").insert({
        "course_name": course_name,
        "course_number": course_number
    }).execute()
    return response.data
