"use client";
import supabase from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function Dashboard() {
    type Course = {
        id: number;
        course_number: string;
        course_name: string;
    };

    const [courses, setCourses] = useState<Course[]>([]);
    const [courseName, setCourseName] = useState("");
    const [courseNumber, setCourseNumber] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();

    async function handleFileUpload() {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }
        
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://127.0.0.1:8000/upload/", {
            method: "POST",
            body: formData,
        });
    }

    // Handle adding a new course
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

    // Clean the data
    if (!courseNumber.trim() || !courseName.trim()) {
        alert("Please fill in both course number and course name.");
        return;
    }

    console.log("Course added:", data);

    // Clear inputs
    setCourseName("");
    setCourseNumber("");

    // Refresh table
    window.location.reload();
}

    async function handleLogOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error.message);
        } else {
            router.push("/login")
        }
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
                <h1 className="font-bold text-3xl pt-4 pl-4">Dashboard</h1>
                <h3 className="pl-4">Setup your semester</h3>
                
            </div>
            
            <div>
                <h1 className="font-bold text-xl pt-10 pl-4">Courses</h1>
                <div>
                    <input className="border ml-4 p-2 mt-2 hover:bg-gray-200" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                    <button className="p-2 ml-2 rounded hover:bg-blue-200 border" onClick={handleFileUpload}>Upload Course Schedule</button>
                </div>
                
                <div className="mt-3">
                    <input className="border ml-4 p-2" maxLength={10} placeholder="Enter course number" value={courseNumber} onChange={(e) => setCourseNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
                    <input className="border ml-1 p-2" placeholder="Enter course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                    <button className="p-2 ml-3 rounded hover:bg-blue-200 border" onClick={handleAddCourse}>Add Course</button>
                </div>
            </div>

            <div className="pt-10">
                <h1 className="font-bold text-xl pt-4 pl-4">My courses</h1>

                <div className="flex justify-start">
                    <table className="border-collapse border border-gray-400 ml-4">
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

            <div className="pt-10">
                <button className="p-2 ml-3 rounded hover:bg-blue-200 border" onClick={handleLogOut}>Log Out</button>
            </div>
        </div>
    )
}