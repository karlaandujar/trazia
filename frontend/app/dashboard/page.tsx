"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
    type Course = {
        id: number;
        course_number: string;
        course_name: string;
    };

    const [courses, setCourses] = useState<Course[]>([]);
    const [courseName, setCourseName] = useState("");
    const [courseNumber, setCourseNumber] = useState("");

    
    async function handleAddCourse() {
    const response = await fetch("http://127.0.0.1:8000/courses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            course_name: courseName,
            course_number: courseNumber,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Error adding course:", data);
        return;
    }

    console.log("Course added:", data);

    // Clear inputs
    setCourseName("");
    setCourseNumber("");

    // Refresh table
    window.location.reload();
}

    useEffect(() => {
    fetch("http://127.0.0.1:8000/courses")
      .then((response) => response.json())
      .then((data) => {
        setCourses(data);
      });
    }, []);

    return (
        <div>
            <div>
                <h1>Dashboard</h1>
                <h3>Setup your semester</h3>
                
            </div>
            
            <div className="pt-10">
                <h1>Courses</h1>
                <input placeholder="Enter course number" value={courseNumber} onChange={(e) => setCourseNumber(e.target.value)} />
                <input placeholder="Enter course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                <button onClick={handleAddCourse}>Add Course</button>
            </div>

            <div className="pt-10">
                <h1>My courses</h1>

                <div className="flex justify-start mt-4">
                    <table className="border-collapse border border-gray-400">
                    <thead>
                        <tr>
                        <th className="border border-gray-400 px-4 py-1">Course Number</th>
                        <th className="border border-gray-400 px-4 py-1">Course Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                        <tr key={course.id}>
                            <td className="border border-gray-400 px-4 py-1">{course.course_number}</td>
                            <td className="border border-gray-400 px-4 py-1">{course.course_name}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}