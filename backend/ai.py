import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=key)

# Function to extract assignments from text using the Gemini API
def get_assignments(text):
    interaction = client.interactions.create(
        model="gemini-3.1-flash-lite",
        input="""Extract all the assignments, exams, quizzes, labs, projects, discussions, participation grades, and deadlines from the course schedule. 
        Return only valid JSON following the schema: 
        {{
            "assignments": [
              {{
                "title": "Assignment", 
                "type": "Homework", 
                "due_date": "2023-10-15", 
                "points": 25, 
                "weight": 0.2
              }}, 
              {{
                "title": "Midterm 1",
                "type": "Exam", 
                "due_date": "2026-10-15", 
                "points": 100, 
                "weight": 0.50
                }}
            ] 
        }}

        It is okay to leave what is not stated as a null or default value. {sched}""".format(sched=text)
    )
    return interaction.output_text
