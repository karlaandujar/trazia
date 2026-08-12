"use client";
import supabase from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";


export default function Dashboard() {
    type Course = {
        id: number;
        course_number: string;
        course_name: string;
    };

    type Assignment = {
        id: number;
        title: string;
        type: string;
        due_date: string;
        points: number;
        weight: number;
    };

    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [courseName, setCourseName] = useState("");
    const [courseNumber, setCourseNumber] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();

    
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
        // Refresh table
        window.location.reload();
    }

    // Function to log out a user when button is clicked
    async function handleLogOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error.message);
        } else {
            router.push("/login"); // Send them back to the login screen
        }
    }

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

            fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments`, { headers: {"Authorization": "Bearer " + token}})
            .then((response) => response.json())
            .then((data) => {
                setAssignments(data);
                console.log(data);
                console.log(Array.isArray(data));
            });
        }
    }

    // Load courses from backend
    useEffect(() => {
        loadData()
    }, []);


    return (
        <div className="px-2 py-2">
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden min-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)]">
                {/* Navigation bar */}
                <nav className="bg-white text-white sticky top-0 z-50 border-b-4 border-gray-100 justify-between">
                    <div className="mx-auto px-6">
                        <div className="relative flex justify-between align-items-center h-20">

                            <div className="flex items-center absolute left-0 inset-y-0">
                                <h1 className="text-4xl font-semibold tracking-widest text-gray-900">Trazia</h1>
                            </div>

                            <div className="flex items-center absolute left-1/2 -translate-x-1/2 inset-y-0 gap-10">
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300">About</h1>
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300">Features</h1>
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300">Contact</h1>
                            </div>

                            <div className="flex items-center absolute right-0 inset-y-0 gap-3">
                                <img className="h-13 w-13 rounded-full" src="/notification.png" alt="Notification" />
                                <img className="h-13 w-13 rounded-full" src="/profile.png" alt="Profile" />
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="flex justify-between gap-1 mx-2 px-16 py-12 grid grid-rows-4 bg-[url('/trazia_hero_bg.png')] bg-cover bg-position-[2%_20%]">
                    {/* Headers */}
                    <div className="pt-8">
                        <h1 className="font-semibold text-3xl text-slate-800">Welcome</h1>
                        <h3 className="text-slate-700">Here's what's happening with your semester.</h3>
                    </div>
                    
                    {/* Semester statistics */}
                    <div className="flex">
                        {/* Number of courses */}
                        <div className="flex items-center justify-center bg-white rounded-xl p-4 pr-12 shadow-md">
                            <div className="flex size-15 items-center justify-center rounded-full bg-[#DCEBF5] mr-5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-2xl font-bold">{courses.length}</p>
                                <p className="text-slate-700 font-semibold">Courses</p>
                                <p className="text-slate-500">This semester</p>
                            </div>
                        </div>
                    </div>


                    <div>
                        <h1 className="font-bold text-xl pt-10 pl-4">Courses</h1>
                        <div>

                            <select className="border p-2 ml-4" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.course_number} - {course.course_name}
                                    </option>
                                ))}
                            </select>

                            <input className="border ml-4 p-2 mt-2 hover:bg-gray-200" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                            <button className="p-2 ml-2 rounded hover:bg-blue-200 border" onClick={handleFileUpload}>Upload Course Schedule</button>
                        </div>
                        
                        <div className="mt-3">
                            <input className="border ml-4 p-2" maxLength={10} placeholder="Enter course number" value={courseNumber} onChange={(e) => setCourseNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, ""))} />
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
                        <h1 className="font-bold text-xl pt-4 pl-4">My assignments</h1>

                        <div className="flex justify-start">
                            <table className="border-collapse border border-gray-400 ml-4">
                            <thead>
                                <tr>
                                <th className="border border-gray-400 px-4 py-1">Title</th>
                                <th className="border border-gray-400 px-4 py-1">Type</th>
                                <th className="border border-gray-400 px-4 py-1">Due Date</th>
                                <th className="border border-gray-400 px-4 py-1">Points</th>
                                <th className="border border-gray-400 px-4 py-1">Weight</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((assignment) => (
                                    <tr key={assignment.id}>
                                        <td className="border border-gray-400 px-4 py-1">{assignment.title}</td>
                                        <td className="border border-gray-400 px-4 py-1">{assignment.type}</td>
                                        <td className="border border-gray-400 px-4 py-1">{assignment.due_date}</td>
                                        <td className="border border-gray-400 px-4 py-1">{assignment.points}</td>
                                        <td className="border border-gray-400 px-4 py-1">{assignment.weight}</td>
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
            </div>
        </div>
    )
}