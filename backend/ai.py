import json
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=key)

# Function to extract assignments from text using the Gemini API
def get_assignments_from_sched(text):
    interaction = client.interactions.create(
        model="gemini-3.1-flash-lite",
        input="""Extract all the assignments, exams, quizzes, labs, projects, discussions, participation, and deadlines from the course schedule.
        Return only valid JSON following the schema: 
        {{
            "assignments": [
              {{
                "title": "Assignment", 
                "type": "Homework", 
                "due_date": "2026-08-31T23:59:00", 
                "points": 25, 
                "weight": 0.2
              }}, 
              {{
                "title": "Midterm 1",
                "type": "Exam", 
                "due_date": "2026-09-31T21:59:00", 
                "points": 100, 
                "weight": 0.50,
                "subject": CS
                }}
            ] 
        }}

        It is okay to leave what is not stated as a null or default value. Do not wrap the response in Markdown code fences. Do not include explanations or commentary. Infer 1-3 characters for the subject using the course number; 
        for example if the course is PHYS 1101, the subject would be 'PH' or the subject for math would be 'MA'. Only return due dates that are valid calendar dates. Use the type values like "Homework", "Assignment", "Quiz", "Exam", "Pre-Lab", "Post-Lab", "Discussion", and "Participation" {sched}""".format(sched=text)
    )
    # Convert the JSON into a dictionary and return
    try:
      return json.loads(interaction.output_text)
    except Exception as e:
      print(f"Could not parse uploaded file: {e}")