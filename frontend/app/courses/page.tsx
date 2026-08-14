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
    const [showAddCourse, setShowAddCourse] = useState(false);
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
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300 cursor-pointer">Dashboard</h1>
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300 cursor-pointer">Courses</h1>
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300 cursor-pointer">Assignments</h1>
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300 cursor-pointer">Calendar</h1>
                            </div>

                            <div className="flex items-center absolute right-0 inset-y-0 gap-3">
                                <img className="h-13 w-13 rounded-full cursor-pointer" src="/notification.png" alt="Notification" />
                                <img className="h-13 w-13 rounded-full cursor-pointer" src="/profile.png" alt="Profile" />
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="flex gap-1 mx-2 px-16 pt-12 flex flex-col gap-8 bg-[url('/trazia_hero_bg.png')] bg-cover bg-position-[2%_20%]">
                    {/* Headers and course addition button */}
                    <div className="flex relative pt-6">
                        <div>
                            <h1 className="font-semibold text-3xl text-slate-800">Courses</h1>
                            <h3 className="text-slate-700">Manage your courses and easily track progress in each one.</h3>
                        </div>

                        <button className="absolute items-center flex right-0 p-3 pr-4 ml-2 mt-7 rounded-xl bg-[#6182cd] text-white cursor-pointer font-normal hover:bg-slate-400" onClick={() => setShowAddCourse(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Course
                        </button>
                    </div>

                    {/* Add course card - only shows if button was clicked */}
                    {showAddCourse && <div className="bg-slate-200 absolute inset-30 bottom-50 top-50 z-10 p-4">
                        <p>ADD COURSE CARD</p>
                        <button className="bg-blue-200 cursor-pointer" onClick={() => setShowAddCourse(false)}>X</button>

                        {/* File uploads */}
                        <div>
                            <select className="border p-2 ml-4" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.course_number} - {course.course_name}
                                    </option>
                                ))}
                            </select>

                            <input className="border ml-4 p-2 mt-2 cursor-pointer hover:bg-gray-200" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                            <button className="p-2 ml-2 rounded hover:bg-blue-200 border cursor-pointer" onClick={handleFileUpload}>Upload Course Schedule</button>
                        </div>
                    
                        {/* Manual course additions */}
                        <div className="mt-3">
                            <input className="border ml-4 p-2" maxLength={10} placeholder="Enter course number" value={courseNumber} onChange={(e) => setCourseNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, ""))} />
                            <input className="border ml-1 p-2" placeholder="Enter course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                            <button className="p-2 ml-3 rounded hover:bg-blue-200 border cursor-pointer" onClick={handleAddCourse}>Add Course</button>
                        </div>
                    </div>
                    }

                    <div className="mb-6">
                        {/* Course section headers */}
                        <div className="flex justify-between relative">
                            <h1 className="font-semibold text-xl pt-10 pb-4">{courses.length} Courses</h1>
                        </div>
                        
                        {/* Individual course cards */}
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {courses.map((course) => (
                            <div key={course.id} className="items-center justify-center bg-white rounded-xl shadow-md p-4 min-h-45">
                                <div className="flex">
                                    <div className="flex size-15 items-center justify-center rounded-lg bg-[#DCEBF5] mr-5">
                                        <p className="font-semibold text-2xl text-slate-600">{course.subject}</p>
                                    </div>
                                    <div>
                                        <p className='font-semibold text-slate-800 text-xl'>{course.course_number}</p>
                                        <p className='text-slate-600'>{course.course_name}</p>
                                    </div>
                                </div>
                                
                                <p className='text-sm pt-4'>assignment count, next up task, view course info coming soon...</p>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}