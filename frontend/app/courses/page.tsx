"use client";
import supabase from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { getNav } from "../dashboard/page";

export default function Courses() {
    type Course = {
        id: string;
        course_number: string;
        course_name: string;
        subject: string;
        prof: string;
        email: string;
        office_hours: string;
        loc: string;
        time: string;
    };

    const [courses, setCourses] = useState<Course[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [activeTab, setActiveTab] = useState("manual");
    const router = useRouter();

    // Variables for details within add course card
    const [courseName, setCourseName] = useState("");
    const [courseNumber, setCourseNumber] = useState("");
    const [courseSubject, setCourseSubject] = useState("");
    const [courseProf, setCourseProf] = useState("");
    const [courseEmail, setCourseEmail] = useState<string | null>(null);
    const [courseOffHrs, setCourseOffHrs] = useState<string | null>(null);
    const [courseTime, setCourseTime] = useState("");
    const [courseLoc, setCourseLoc] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [selectedCourse, setSelectedCourse] = useState("");

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

    // Helper function to load courses table upon course addition
    async function loadCourses() {
        const token = session?.access_token;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();
        setCourses(data);
    }

    // Receive the submission of the form to add a course and add it
    const handleAddCourse = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await addCourse();
        // After the course is added, clear inputs, remove the card from the screen and reload the table
        setCourseName("");
        setCourseNumber("");
        setCourseProf("");
        setCourseEmail(null);
        setCourseOffHrs(null);
        setCourseLoc("");
        setCourseTime("");
        setCourseSubject("");

        loadCourses()
    }

    // Helper function to add the course
    async function addCourse() {
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
                subject: courseSubject,
                prof: courseProf,
                email: courseEmail,
                office_hours: courseOffHrs,
                loc: courseLoc,
                time: courseTime
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
        /* Overlay on entire div if the card is open */
        <div className={`px-2 py-2 ${showAddCourse ? 'before:fixed before:absolute before:inset-0 before:z-50 before:bg-black/30' : '' }`}>
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden min-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)]">
                {/* Navigation bar */}
                { getNav() }

                <div className="flex gap-1 mx-2 px-16 pt-12 flex flex-col gap-8 bg-[url('/trazia_hero_bg.png')] min-h-[calc(100vh-7rem)] rounded-3xl bg-cover bg-position-[2%_20%]">
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
                    {showAddCourse && <div className="bg-white absolute inset-0 m-auto z-60 p-4 max-w-[calc(31%)] max-h-[570px] rounded-2xl">
                        <div className="flex justify-between pb-5">
                            <div>
                                <h1 className="font-semibold text-xl text-slate-800 pb-1">Add Course</h1>
                                <h3 className="text-slate-600 text-sm">Add your course details to get started.</h3>
                            </div>
                            <button className="cursor-pointer text-2xl" onClick={() => setShowAddCourse(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg> 
                            </button>
                        </div>
                        
                        {/* Tabs for manual entry or upload */}
                        <div className="flex justify-center">
                            <button 
                                className="cursor-pointer border border-gray-300 rounded-xs py-2 px-10 hover:bg-gray-100" 
                                onClick={() => setActiveTab("manual")}><span className="font-semibold text-md text-slate-800">Manual Entry</span>
                                <p className="text-slate-500 text-xs">Type in the details</p>
                            </button>

                            <button 
                                className="cursor-pointer border border-gray-300 rounded-xs py-2 px-6 hover:bg-gray-100" 
                                onClick={() => setActiveTab("upload")}><span className="font-semibold text-md text-slate-800">Upload File</span>
                                <p className="text-slate-500 text-xs">Upload a course syllabus to auto-fill</p>
                            </button>
                        </div>


                        {/* Manual course additions */}
                        {activeTab === "manual" && (<form onSubmit={handleAddCourse}>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-5 mt-3">

                                {/* Course number - required */}
                                <div>
                                    <p className="font-semibold text-slate-800">Course Number<span className="text-red-700">*</span></p>
                                    <input 
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full"
                                        maxLength={9}
                                        value={courseNumber}
                                        placeholder="e.g. CS 2114"
                                        onChange={(e) => setCourseNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, ""))}
                                        required>
                                    </input>
                                </div>

                                {/* Course name - required */}
                                <div>
                                    <p className="font-semibold text-slate-800">Course Name<span className="text-red-700">*</span></p>
                                    <input 
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full"
                                        value={courseName}
                                        placeholder="e.g. Data Structures"
                                        onChange={(e) => setCourseName(e.target.value)}
                                        required>
                                    </input>
                                </div>

                                {/* Professor - required */}
                                <div>
                                    <p className="font-semibold text-slate-800">Professor<span className="text-red-700">*</span></p>
                                    <input 
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full"
                                        value={courseProf}
                                        placeholder="e.g. Alyssa Smith"
                                        onChange={(e) => setCourseProf(e.target.value)}
                                        required>
                                    </input>
                                </div>

                                {/* Email - optional */}
                                <div>
                                    <p className="font-semibold text-slate-800">Email</p>
                                    <input
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full"
                                        value={courseEmail ?? ""}
                                        type="email"
                                        placeholder="e.g. smith@vt.edu"
                                        onChange={(e) => setCourseEmail(e.target.value)}>                                
                                    </input>
                                </div>

                                {/* Course office hours - optional */}
                                <div>
                                    <p className="font-semibold text-slate-800">Office Hours</p>
                                    <input
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full"
                                        value={courseOffHrs ?? ""}
                                        placeholder="e.g. MWF 2-4, TR 9-11"
                                        onChange={(e) => setCourseOffHrs(e.target.value)}>                                
                                    </input>
                                </div>

                                {/* Course location - required */}
                                <div>
                                    <p className="font-semibold text-slate-800">Location<span className="text-red-700">*</span></p>
                                    <input 
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full"
                                        value={courseLoc}
                                        maxLength={12}
                                        placeholder="e.g. MCB 123"
                                        onChange={(e) => setCourseLoc(e.target.value.toUpperCase())}
                                        required>
                                    </input>
                                </div>

                                {/* Course meeting time - required */}
                                <div>
                                    <p className="font-semibold text-slate-800">Meeting Time<span className="text-red-700">*</span></p>
                                    <input 
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full"
                                        value={courseTime}
                                        placeholder="e.g. MWF 10:15-11:00"
                                        onChange={(e) => setCourseTime(e.target.value)}
                                        required>
                                    </input>
                                </div>

                                {/* Subject for icon - required */}
                                <div>
                                    <p className="font-semibold text-slate-800">Subject (used for icon)<span className="text-red-700">*</span></p>
                                    <input 
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full"
                                        maxLength={2}
                                        value={courseSubject}
                                        placeholder="e.g. PH"
                                        onChange={(e) => setCourseSubject(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                                        required>
                                    </input>
                                </div>
                                
                                {/* Button to add the course */}
                                <div className="absolute right-6 translate-y-87">
                                    <button className="items-center p-2 rounded-xl bg-[#6182cd] text-white text-[15px] cursor-pointer hover:bg-slate-400" type="submit">Add Course</button>
                                </div>

                            </div>
                        </form>)}


                        {/* File uploads */}
                        {activeTab === "upload" && (<div>
                            
                        </div>)}

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