"use client";
import supabase from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

export default function Courses() {
    type Course = {
        id: number;
        course_number: string;
        course_name: string;
        subject: string;
    };

    const [courses, setCourses] = useState<Course[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [courseName, setCourseName] = useState("");
    const [courseNumber, setCourseNumber] = useState("");
    const [courseSubject, setCourseSubject] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [selectedCourse, setSelectedCourse] = useState("");
    const router = useRouter();

    // Loads the data like session and user
    async function loadData(){
        // Check if there is a session
        const { data } = await supabase.auth.getSession()
        if (!data.session){
            router.push("/login");
        }
        else{
            setSession(data.session);
            const token = data.session.access_token
            
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { headers: {"Authorization": "Bearer " + token}})
            .then((response) => response.json())
            .then((data) => {
                setCourses(data);
            });

        }
    }

    // Load courses from backend
    useEffect(() => {
        loadData()
    }, []);

    // Function that handles PDF uploads for course additions
    async function handleFileUpload() {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }
        // Get user token and create form with necessary data
        const token = session?.access_token;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("course_id", selectedCourse);
        // POST method to send the file to the backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });
    }

    // Handle adding a new course
    async function handleAddCourse() {
        const token = session?.access_token;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                course_name: courseName,
                course_number: courseNumber,
                subject: courseSubject
            }),
        });
        // Ensure no errors in adding the course
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
        // Log that the course was added
        console.log("Course added:", data);
        // Clear inputs
        setCourseName("");
        setCourseNumber("");
        setCourseSubject("");
        // Refresh table
        window.location.reload();
    }

    return(
        <div>
            <div className="flex justify-between relative">
                <h1 className="font-bold text-xl pt-10 pl-4">add courses</h1>
            </div>

            <div>
                <select className="border p-2 ml-4" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.course_number} - {course.course_name}
                        </option>
                    ))}
                </select>

                <input className="border ml-4 p-2 mt-2  cursor-pointer hover:bg-gray-200" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                <button className="p-2 ml-2 rounded hover:bg-blue-200 border cursor-pointer" onClick={handleFileUpload}>Upload Course Schedule</button>
            </div>
            <div className="mt-3">
                <input className="border ml-4 p-2" maxLength={10} placeholder="Enter course number" value={courseNumber} onChange={(e) => setCourseNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, ""))} />
                <input className="border ml-1 p-2" placeholder="Enter course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                <button className="p-2 ml-3 rounded hover:bg-blue-200 border cursor-pointer" onClick={handleAddCourse}>Add Course</button>
            </div>
        </div>
    )
}