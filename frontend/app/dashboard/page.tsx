"use client";
import supabase from "@/lib/supabase";
import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import next from "next";

export default function Dashboard() {
    type Course = {
        id: number;
        course_number: string;
        course_name: string;
        subject: string;
    };

    type Assignment = {
        id: number;
        title: string;
        type: string;
        courses: {course_number: string, course_name: string};
        due_date: string;
        points: number;
        weight: number;
    };

    type Exam = {
        id: number;
        title: string;
        type: string;
        courses: {course_number: string, course_name: string};
        due_date: string;
        points: number;
        weight: number;
    };

    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [weekExams, setWeekExams] = useState<Exam[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();

    
    

    // Function to log out a user when button is clicked
    async function handleLogOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error.message);
        } else {
            router.push("/login"); // Send them back to the login screen
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
            
            // Fetch user courses
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { headers: {"Authorization": "Bearer " + token}})
            .then((response) => response.json())
            .then((data) => {
                setCourses(data);
            });

            // Fetch user assignments this week except for exams
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments?assignment_type=current_week`, { headers: {"Authorization": "Bearer " + token}})
            .then((response) => response.json())
            .then((data) => {
                setAssignments(data);
                console.log(data);
                console.log(Array.isArray(data));
            });

            // Fetch only user exams
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments?assignment_type=exam`, { headers: {"Authorization": "Bearer " + token}})
            .then((response) => response.json())
            .then((data) => {
                setExams(data);
                console.log(data);
                console.log(Array.isArray(data));
            });

            // Fetch only user exams this week
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments?assignment_type=current_week_exams`, { headers: {"Authorization": "Bearer " + token}})
            .then((response) => response.json())
            .then((data) => {
                setWeekExams(data);
                console.log(data);
                console.log(Array.isArray(data));
            });
        }
    }

    // Get next assignment from already fetched assignments of this week
    const nextAssignment = assignments[0];

    // Calculate days until for next assignment
    function getDaysUntil(dueDate: string) {
        const now = new Date();
        const due = new Date(dueDate);

        const diff = due.getTime() - now.getTime();

        const daysUntil = Math.ceil(diff / (1000*60*60*24));

        // Return days if it is not today or tomorrow
        if (daysUntil <= 0) return "Due today";
        if (daysUntil === 1) return "Due tomorrow";
        return `Due in ${daysUntil} days`;
    }

    // Load courses from backend
    useEffect(() => {
        loadData()
    }, []);


    return (
        <div className="px-2 py-2">
            <div className="bg-white pb-3 rounded-3xl shadow-sm overflow-hidden min-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)]">
                {/* Navigation bar */}
                { getNav() }

                <div className="flex gap-1 mx-2 px-16 pt-12 flex flex-col gap-8 bg-[url('/trazia_hero_bg.png')] rounded-3xl bg-cover bg-position-[2%_20%]">
                    {/* Headers */}
                    <div className="pt-8">
                        <h1 className="font-semibold text-3xl text-slate-800">Welcome</h1>
                        <h3 className="text-slate-700">Here's what's happening with your semester.</h3>
                    </div>
                    
                    {/* Semester statistics */}
                    <div className="flex gap-[calc(3rem)]">
                        <div className="h-45 flex gap-[calc(3rem)]">
                            {/* Number of courses */}
                            <div className="flex items-center justify-center bg-white rounded-xl p-10 pr-17 shadow-md w-75">
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

                            {/* Number of assignments this week */}
                            <div className="flex items-center justify-center bg-white rounded-xl p-10 pr-17 shadow-md">
                                <div className="flex size-15 items-center justify-center rounded-full bg-[#DCEBF5] mr-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">{assignments.length}</p>
                                    <p className="text-slate-700 font-semibold">Assignments</p>
                                    <p className="text-slate-500">This week</p>
                                </div>
                            </div>

                            {/* Number of exams this week */}
                            <div className="flex items-center justify-center bg-white rounded-xl p-10 pr-17 shadow-md w-65">
                                <div className="flex size-15 items-center justify-center rounded-full bg-[#DCEBF5] mr-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">{weekExams.length}</p>
                                    <p className="text-slate-700 font-semibold">Exams</p>
                                    <p className="text-slate-500">This week</p>
                                </div>
                            </div>
                        </div>
                        
                        { /* Next up assignment*/ }
                        <div className="bg-[#f7f9fa] rounded-xl min-w-[calc(30%)] min-h-[13rem] shadow-md">
                            <div className="flex pt-5 pl-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2 text-[#5775d6]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                </svg>

                                <p className="text-[#5775d6] text-xl font-semibold">Next up</p>
                            </div>
                            
                            {/* Only show assignment if there is one available to show */}
                            {nextAssignment ? (
                                <>
                                    <p className="text-slate-700 text-2xl font-semibold pt-3 pl-4">{nextAssignment.title}</p>
                                    <p className="text-slate-700 text-sm pt-1 pl-4">{nextAssignment.courses.course_number} • {nextAssignment.courses.course_name}</p>

                                    <div className="flex pt-4 pl-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                        </svg>

                                        <p className="text-slate-700 text-sm pl-2">{getDaysUntil(nextAssignment.due_date)}: {formatDate(nextAssignment.due_date)}</p>
                                    </div>

                                    <button className="cursor-pointer flex border border-slate-300 min-w-[calc(100%-2rem)] text-[#5775d6] font-semibold mb-3 mt-7 pl-[calc(30%)] py-2 px-4 rounded-lg hover:bg-[#e3eaff] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ml-4">
                                        View assignment 
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 pl-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                        </svg>
                                    </button>
                                </>
                                ) : (
                                    <p className="text-slate-700 text-xl font-semibold pt-3 pl-4">No upcoming assignments!</p>
                                )}
                        </div>
                    </div>

                    <div>
                        {/* Course section headers */}
                        <div className="flex justify-between relative">
                            <h1 className="font-bold text-xl pt-10 pl-4 pb-4">My Courses</h1>
                            <button className="font-semibold text-md pt-10 text-[#5775d6] absolute right-0 flex cursor-pointer" onClick={() => router.push("/courses")}>
                                View all courses
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 pl-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                </svg>
                            </button>
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
                                
                                <p className='text-sm pt-4'>progress bar, assignment count, view course button, three dots (modify course) coming soon...</p>
                            </div>
                            ))}
                        </div>
                    </div>


                    <div className="pt-10 flex gap-5">
                        {/* Upcoming assignments table */}
                        <div className="bg-white rounded-xl shadow-md p-4 min-w-[50%]">
                            <div className="relative justify-between">
                                <h1 className="font-semibold text-xl pb-4">Assignments This Week</h1>
                                <button className="font-semibold text-md pt-10 text-[#5775d6] absolute right-0 -top-9 flex cursor-pointer" onClick={() => router.push("/assignments")}>
                                    View all assignments
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 pl-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                    </svg>
                                </button>
                            </div>

                            <table className="justify-between w-[100%]">
                                <thead>
                                    <tr>
                                        <th className="border-b border-gray-300 px-5 py-1 font-semibold text-slate-700">Assignment</th>
                                        <th className="border-b border-gray-300 px-4 py-1 font-semibold text-slate-700">Course</th>
                                        <th className="border-b border-gray-300 px-4 py-1 font-semibold text-slate-700">Due Date</th>
                                        <th className="border-b border-gray-300 px-4 py-1 font-semibold text-slate-700">Points</th>
                                        <th className="border-b border-gray-300 px-4 py-1 font-semibold text-slate-700">Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                {assignments.map((assignment) => (
                                    <tr key={assignment.id}>
                                        <td className="border-b border-gray-300 px-5 py-1 font-semibold text-slate-700">{assignment.title}</td>
                                        <td className="border-b border-gray-300 px-4 py-1 text-slate-700">{assignment.courses.course_number}</td>
                                        <td className="border-b border-gray-300 px-4 py-1 text-slate-700">{formatDate(assignment.due_date)}</td>
                                        <td className="border-b border-gray-300 px-4 py-1 text-slate-700">{assignment.points}</td>
                                        <td className="border-b border-gray-300 px-4 py-1 text-slate-700">    </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        
                        {/* Exams table */}
                        <div className="bg-white rounded-xl shadow-md p-4 min-w-[50%]">
                            <h1 className="font-semibold text-xl pb-4">Next Exams</h1>
                            <table className="justify-between w-[100%]">
                                <thead>
                                    <tr>
                                        <th className="border-b border-gray-300 px-5 py-1 font-semibold text-slate-700">Date</th>
                                        <th className="border-b border-gray-300 px-5 py-1 font-semibold text-slate-700">Course</th>
                                        <th className="border-b border-gray-300 px-5 py-1 font-semibold text-slate-700">Exam</th>
                                    </tr>
                                </thead>
                                
                                <tbody className="text-center">
                                    {exams.map((exam) => (
                                        <tr key={exam.id}>
                                            <td className="border-b border-gray-300 px-4 py-3 text-slate-700">{formatDate(exam.due_date)}</td>
                                            <td className="border-b border-gray-300 px-4 py-3 text-slate-700">{exam.courses.course_number}</td>
                                            <td className="border-b border-gray-300 px-4 py-3 text-slate-700">{exam.title}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                    </div>
                    <div className="pt-10 pb-3">
                        <button className="bg-white p-2 ml-3 rounded hover:bg-blue-200 border cursor-pointer" onClick={handleLogOut}>Log Out</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Returns the nav bar (used on other pages)
    export const getNav = (): JSX.Element => {
        const router = useRouter();
        return (
            <nav className="bg-white text-white sticky top-0 z-30 border-b-4 border-gray-100 justify-between">
                    <div className="mx-auto px-6">
                        <div className="relative flex justify-between align-items-center h-20">

                            <div className="flex items-center absolute left-0 inset-y-0">
                                <h1 className="text-4xl font-semibold tracking-widest text-gray-900">Trazia</h1>
                            </div>

                            <div className="flex items-center absolute left-1/2 -translate-x-1/2 inset-y-0 gap-10">
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300 cursor-pointer" onClick={() => router.push("/dashboard")}>Dashboard</h1>
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300 cursor-pointer" onClick={() => router.push("/courses")}>Courses</h1>
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300 cursor-pointer" onClick={() => router.push("/assignments")}>Assignments</h1>
                                <h1 className="text-gray-700 text-2xl hover:text-black transition duration-300 cursor-pointer">Calendar</h1>
                            </div>

                            <div className="flex items-center absolute right-0 inset-y-0 gap-3">
                                <img className="h-13 w-13 rounded-full cursor-pointer" src="/notification.png" alt="Notification" />
                                <img className="h-13 w-13 rounded-full cursor-pointer" src="/profile.png" alt="Profile" />
                            </div>
                        </div>
                    </div>
                </nav>
        )
    };
    