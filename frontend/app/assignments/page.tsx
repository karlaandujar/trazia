"use client";
import supabase from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { getNav } from "../dashboard/page";

export default function Assignments() {
    type Assignment = {
        id: number;
        title: string;
        type: string;
        due_date: string;
        points: number;
        weight: number;
    };

    type Exam = {
        id: number;
        title: string;
        type: string;
        due_date: string;
        points: number;
        weight: number;
    };

    type Course = {
        id: number;
        course_number: string;
        course_name: string;
        subject: string;
    };

    const [showAddAssignment, setShowAddAssignment] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    // Assignment addition detail variables
    const [selectedCourse, setSelectedCourse] = useState("");
    const [assignmentTitle, setAssignmentTitle] = useState("");


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
            
            // Fetch user assignments AND exams
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments`, { headers: {"Authorization": "Bearer " + token}})
            .then((response) => response.json())
            .then((data) => {
                setAssignments(data);
                console.log(data);
                console.log(Array.isArray(data));
            });

            // Fetch the user courses
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { headers: {"Authorization": "Bearer " + token}})
            .then((response) => response.json())
            .then((data) => {
                setCourses(data);
            });
        }
    }

    // Function to format the date nicer
    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
    }

    // Load courses from backend
    useEffect(() => {
        loadData()
    }, []);

    return (
        /* Overlay on entire div if the add assignment card is open */
        <div className={`px-2 py-2 ${showAddAssignment ? 'before:absolute before:inset-0 before:z-50 before:bg-black/30' : '' }`}>
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden min-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)]">
                {/* Navigation bar */}
                { getNav() }

                <div className="flex gap-1 mx-2 px-16 pt-12 flex flex-col gap-8 bg-[url('/trazia_hero_bg.png')] min-h-[calc(100vh-7rem)] rounded-3xl bg-cover bg-position-[2%_20%]">
                    {/* Headers and assignment addition button */}
                    <div className="flex relative pt-6">
                        <div>
                            <h1 className="font-semibold text-3xl text-slate-800">Assignments</h1>
                            <h3 className="text-slate-700">View and manage all of your assignments in one place.</h3>
                        </div>

                        <button className="absolute items-center flex right-0 p-3 pr-4 ml-2 mt-7 rounded-xl bg-[#6182cd] text-white cursor-pointer font-normal hover:bg-slate-400" onClick={() => setShowAddAssignment(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Assignment
                        </button>
                    </div>

                    {/* Add assignments card, only shows when button is clicked */}
                    {showAddAssignment && <div className="bg-white absolute inset-0 m-auto z-60 p-4 max-w-[calc(31%)] max-h-[calc(70%)] rounded-2xl">
                        <div className="flex justify-between pb-5">
                            <div>
                                <h1 className="font-semibold text-xl text-slate-800 pb-1">Add Assignment</h1>
                                <h3 className="text-slate-600 text-sm">Add the details of your assignment below.</h3>
                            </div>
                            <button className="cursor-pointer text-2xl" onClick={() => setShowAddAssignment(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg> 
                            </button>
                        </div>

                        {/* Options of details */}
                        <div className="flex">
                            {/* Course selection */}
                            <div className="pr-4">
                                <p className="font-semibold text-slate-800">Course</p>
                                <select className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                    <option value="">Select a course</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_number} - {course.course_name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            
                            {/* Assignment title */}
                            <div>
                                <p className="font-semibold text-slate-800">Assignment Title</p>
                                <input className="border border-gray-200 rounded-xl focus:outline-none p-2 min-w-[120%]" placeholder="e.g. Exam 1, Homework 3" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} />
                            </div>
                        </div>


                    </div>}


                    {/* Assignments table */}
                    <div className="bg-white rounded-xl shadow-md p-4 min-w-[50%]">
                        <table className="w-[100%] border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b border-gray-300 px-5 pt-1 pb-3 font-semibold text-slate-700 text-left">Assignment</th>
                                        <th className="border-b border-gray-300 px-4 pt-1 pb-3 font-semibold text-slate-700 text-left">Course</th>
                                        <th className="border-b border-gray-300 px-4 pt-1 pb-3 font-semibold text-slate-700 text-left">Type</th>
                                        <th className="border-b border-gray-300 px-4 pt-1 pb-3 font-semibold text-slate-700 text-left">Due Date</th>
                                        <th className="border-b border-gray-300 px-4 pt-1 pb-3 font-semibold text-slate-700 text-left">Status</th>
                                        <th className="border-b border-gray-300 px-4 pt-1 pb-3 font-semibold text-slate-700 text-left">Points</th>
                                        <th className="border-b border-gray-300 px-4 pt-1 pb-3 font-semibold text-slate-700 text-left">Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {assignments.map((assignment) => (
                                    <tr key={assignment.id}>
                                        <td className="border-b border-gray-200 px-5 py-1 font-semibold text-slate-700 flex items-center">
                                            <div className="p-1 m-1 mr-2 rounded-md bg-[#E5F3FD]">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                                </svg>
                                            </div>

                                            {assignment.title}
                                        </td>
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700">      </td>
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700">{assignment.type}</td>
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700 flex">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2 block h-5 w-5 min-h-[20px] min-w-[20px]">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                            </svg>

                                            {formatDate(assignment.due_date)}
                                        </td>
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700">  </td>
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700">{assignment.points}</td>
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700">    </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                    </div>

                </div>
            </div>
        </div>
    )
}