import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, date, timedelta


# Load environment variables from .env file
load_dotenv()

# Access the variables
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def get_user(token):
    return supabase.auth.get_user(token)

# Gets the users current day and time
def get_current_datetime():
    return datetime.now()

# Gets the users current school week
def get_current_week():
    today = date.today()
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)

    return start, end

# Returns the assignments for the user based on the query parameter
def get_assignments(user_id, assignment_type):
    # Get the user's courses and put them into a list of course ids
    courses = get_courses(user_id)
    course_ids = [course["id"] for course in courses]

    # Check for query parameter and get respective assignments
    if (assignment_type == "exam"):
        response = supabase.table("assignments").select("*").in_("course_id", course_ids).eq("type", "Exam").execute()
    elif (assignment_type == "regular"):
        response = supabase.table("assignments").select("*").in_("course_id", course_ids).neq("type", "Exam").execute()
    elif (assignment_type == "current_week"):
        start, end = get_current_week()
        response = supabase.table("assignments").select("*").in_("course_id", course_ids).gte("due_date", start).lte("due_date", end).execute()
    else:
        response = supabase.table("assignments").select("*").in_("course_id", course_ids).execute()
    
    return response.data

# Adds an assignment to the assignment table
def create_assignment(assignment):
    response = supabase.table("assignments").insert({
        "course_id": str(assignment.course_id),
        "title": assignment.title,
        "type": assignment.type,
        "due_date": assignment.due_date,
        "points": assignment.points,
        "weight": assignment.weight
    }).execute()
    
    return response.data

def get_courses(user_id):
    response = supabase.table("courses").select("*").eq("user_id", user_id).execute()
    courses = response.data
    return courses

def get_course_by_id(course_id, user_id):
    response = supabase.table("courses").select("*").eq("user_id", user_id).eq("id", course_id).execute()
    course = response.data
    if course:
        return course[0]  # Return the first (and only) course found
    else:
        return None  # Return None if no course is found with the given ID

def create_course(course_name: str, course_number: str, user_id):
    if not course_name.strip() or not course_number.strip():
        raise ValueError("Course name and course number cannot be empty.")
    response = supabase.table("courses").insert({
        "course_name": course_name,
        "course_number": course_number,
        "user_id": user_id
    }).execute()
    return response.data

def upload_assignments(course_id, dictionary):
    for assignment in dictionary["assignments"]:
        response = supabase.table("assignments").insert({
            "course_id": str(course_id),
            "title": assignment["title"],
            "type": assignment["type"],
            "due_date": assignment["due_date"],
            "points": assignment["points"],
            "weight": assignment["weight"]
        }).execute()

