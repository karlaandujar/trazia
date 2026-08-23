"use client";
import supabase from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { getNav } from "../dashboard/page";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Assignments() {
    type Assignment = {
        id: number;
        title: string;
        type: string;
        courses: {course_number: string, course_name: string};
        due_date: string;
        points: number;
        weight: number;
        course_id: string;
    };

    type Course = {
        id: string;
        course_number: string;
        course_name: string;
        subject: string;
    };

    const [showAddAssignment, setShowAddAssignment] = useState(false);
    const [showVerify, setShowVerify] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [activeTab, setActiveTab] = useState("manual");
    const [extractedAssignments, setExtractedAssignments] = useState([]);

    // Assignment addition detail variables
    const [selectedCourse, setSelectedCourse] = useState("");
    const [assignmentTitle, setAssignmentTitle] = useState("");
    const [assignmentType, setAssignmentType] = useState("");
    const [assignmentDueDate, setAssignmentDueDate] = useState<Date | null>(new Date());
    const [assignmentPoints, setAssignmentPoints] = useState<number | null>(null);
    const [assignmentWeight, setAssignmentWeight] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [pasted, setPasted] = useState("");


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
            });

            // Fetch the user courses
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { headers: {"Authorization": "Bearer " + token}})
            .then((response) => response.json())
            .then((data) => {
                setCourses(data);
            });
        }
    }

    // Function to format the date (not time) nicer
    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    }

    // Function to format the time nicer
    function formatTime(date: string) {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }

    // Function that handles PDF uploads or pasted text for assignment additions
    async function handleExtract() {
        // Flags for if there is a file or pasted text
        const hasFile = !!file;
        const hasText = pasted.trim().length > 0;
        
        // Ensure that EITHER a file is uploaded or text is pasted
        if (!hasFile && !hasText) {
            alert("Please upload a file or paste a course schedule/assignment list.");
            return;
        }
        if (hasFile && hasText) {
            alert("Please only upload a file OR paste text, not both.");
            return;
        }
        // Ensure a course is selected
        if (selectedCourse === "") {
            alert("Please select a course for these assignments.");
            return;
        }

        // Get user token and create form with necessary data
        const token = session?.access_token;
        const formData = new FormData();
        formData.append("course_id", selectedCourse);

        // Append whatever was uploaded
        if (hasFile) formData.append("file", file);
        else formData.append("pastedText", pasted);

        // POST method to send the form to the backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploadAssignments/`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });

        // Convert assignments to an array and save it
        const data = await response.json();
        setExtractedAssignments(data.assignments);

        // Switch from add assignments card to review card (human verification step)
        /*setSelectedCourse("");
        setAssignmentTitle("");
        setAssignmentType("");
        setAssignmentDueDate(null);
        setAssignmentPoints(null);
        setAssignmentWeight(null);
        */
        // setShowAddAssignment(false);
        setShowVerify(true);
    }


    // Helper function to load assignments table upon assignment addition
    async function loadAssignments() {
        const token = session?.access_token;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();
        setAssignments(data);
    }

    // Variable to receive the submission of manual assignment addition form event and add it
    const handleAddAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await addAssignment();
        // After the assignment is added, clear inputs, remove the card from the screen and reload the table
        setSelectedCourse("");
        setAssignmentTitle("");
        setAssignmentType("");
        setAssignmentDueDate(null);
        setAssignmentPoints(null);
        setAssignmentWeight(null);
        setShowAddAssignment(false);
        loadAssignments();
    }

    // Function to add a singular assignment
    async function addAssignment(){
        const token = session?.access_token;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/singularAssignment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                title: assignmentTitle,
                type: assignmentType,
                due_date: assignmentDueDate?.toISOString(),
                points: assignmentPoints,
                weight: assignmentWeight,
                course_id: selectedCourse
            }),
        });
    }

    // Function to add a bulk of assignments
    async function handleAddBulkAssignments() {
        const token = session?.access_token;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bulkAssignments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                course_id: selectedCourse,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone;,
                assignments: extractedAssignments
            })
        })

        setExtractedAssignments([]);
        setShowVerify(false);
        loadAssignments();
    }

    // Load courses from backend
    useEffect(() => {
        loadData()
    }, []);

    return (
        /* Overlay on entire div if the add assignment card is open */
        <div className={`px-2 py-2 ${showAddAssignment ? 'before:fixed before:absolute before:inset-0 before:z-50 before:bg-black/30' : '' }`}>
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
                    {showAddAssignment && <div className="bg-white absolute inset-0 m-auto z-60 p-4 max-w-[calc(35%)] h-fit rounded-2xl">
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

                        {/* Tabs for manual entry or upload */}
                        <div className="flex justify-center pb-3">
                            <button 
                                className="cursor-pointer border border-gray-300 rounded-xs py-2 px-10 hover:bg-gray-100" 
                                onClick={() => setActiveTab("manual")}><span className="font-semibold text-md text-slate-800">Manual Entry</span>
                                <p className="text-slate-500 text-xs">Type in the details</p>
                            </button>

                            <button 
                                className="cursor-pointer border border-gray-300 rounded-xs py-2 px-6 hover:bg-gray-100" 
                                onClick={() => setActiveTab("upload")}><span className="font-semibold text-md text-slate-800">Upload File</span>
                                <p className="text-slate-500 text-xs">Upload a course schedule or list of assignments to auto-fill</p>
                            </button>
                        </div>


                        {/* Manual assignment additions */}
                        {activeTab === "manual" && (<form onSubmit={handleAddAssignment}>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-5 pb-15">                                
                                {/* Course selection */}
                                <div>
                                    <p className="font-semibold text-slate-800">Course<span className="text-red-700">*</span></p>
                                    <select 
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full" 
                                        value={selectedCourse} 
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        required>
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
                                    <p className="font-semibold text-slate-800">Assignment Title<span className="text-red-700">*</span></p>
                                    <input 
                                        className="border border-gray-200 rounded-xl focus:outline-none p-2 w-full" 
                                        placeholder="e.g. Exam 1, Homework 3" 
                                        value={assignmentTitle} 
                                        onChange={(e) => setAssignmentTitle(e.target.value)}
                                        required />
                                </div>

                                {/* Type of assignment */}
                                <div>
                                    <p className="font-semibold text-slate-800">Type<span className="text-red-700">*</span></p>
                                    <select 
                                        className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full" 
                                        value={assignmentType} 
                                        onChange={(e) => setAssignmentType(e.target.value)}
                                        required>
                                        <option value="">Select type</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Assignment">Assignment</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Prelab">Prelab</option>
                                        <option value="Postlab">Postlab</option>
                                        <option value="Discussion">Discussion</option>
                                        <option value="Participation">Participation</option>
                                    </select>
                                </div>

                                {/* Due date */}
                                <div>
                                    <p className="font-semibold text-slate-800">Due Date<span className="text-red-700">*</span></p>
                                    <DatePicker 
                                        selected={assignmentDueDate} 
                                        onChange={(e: Date | null) => setAssignmentDueDate(e)} 
                                        showTimeSelect
                                        dateFormat="yyyy-MM-dd h:mm aa" minDate={new Date()} 
                                        placeholderText="Click to select a date" 
                                        className="border border-gray-200 rounded-xl p-2 pr-12 focus:outline-none text-slate-500 w-full custom-datepicker-input"
                                        required />
                                </div>

                                {/* Points */}
                                <div>
                                    <p className="font-semibold text-slate-800">Points<span className="text-red-700">*</span></p>
                                    <input 
                                        className="border border-gray-200 rounded-xl focus:outline-none p-2 w-full" 
                                        type="number"
                                        placeholder="e.g. 60" 
                                        value={assignmentPoints ?? ""} 
                                        onChange={(e) => {setAssignmentPoints(e.target.value === "" ? null : Number(e.target.value))}} 
                                        required/>
                                </div>

                                {/* Weight */}
                                <div>
                                    <p className="font-semibold text-slate-800">Weight</p>
                                    <input 
                                        className="border border-gray-200 rounded-xl focus:outline-none p-2 w-full"
                                        type="text"
                                        inputMode="decimal"
                                        min="0"
                                        max="1000"
                                        step="0.001"
                                        placeholder="e.g. 20%" 
                                        value={assignmentWeight ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // Handle empty assignment weights
                                            if (value === "") {
                                                setAssignmentWeight(null);
                                                return;
                                            }
                                            
                                            // Ensure number is within range
                                            const numberVal = Number(value)
                                            if (numberVal >= 0 && numberVal <= 1000 ){
                                                setAssignmentWeight(numberVal);
                                            }

                                        }} />
                                        <span className="absolute right-7 translate-y-2 text-slate-500">%</span>
                                </div>

                                {/* Add assignment button */}
                                <div className="absolute right-6 translate-y-65">
                                        <button className="items-center p-2 rounded-xl bg-[#6182cd] text-white text-[15px] cursor-pointer hover:bg-slate-400" type="submit">Add Assignment</button>
                                </div>
                            </div>
                        </form>)}

                        
                        {/* Upload assignment additions */}
                        {activeTab === "upload" && (<div className="pb-8">
                            {/* Course selection */}
                            <div>
                                <p className="font-semibold text-slate-800">Course<span className="text-red-700">*</span></p>
                                <select 
                                    className="border border-gray-200 rounded-xl p-2 focus:outline-none text-slate-500 w-full" 
                                    value={selectedCourse} 
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    required>
                                    <option value="">Select a course</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_number} - {course.course_name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* File upload */}
                            <label className="border border-gray-300 border-dashed bg-gray-50 flex mt-2 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                                {/* Hidden native file input */}
                                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}/>
                                <div className="bg-[#e2eafb] rounded-xl p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-11 text-[#1361d7]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                                    </svg>
                                </div>
                                    
                                <div className="pl-6">
                                    <p className="font-semibold text-slate-800">Upload File</p>
                                    <p className="text-slate-700 text-xs">Click to browse and upload a course schedule or list of assignments</p>
                                    <p className="text-slate-700 text-xs">Supports PDF</p>
                                </div>
                            </label>

                            {/* Middle line to separate upload and copy/paste text */}
                            <div className="flex items-center gap-3 py-2">
                                <hr className="flex-1 border-gray-200"></hr>
                                <span className="text-sm text-gray-400">or</span>
                                <hr className="flex-1 border-gray-200"></hr>
                            </div> 
                            
                            {/* Paste text box */}
                            <div className="pb-3">
                                <p className="font-semibold text-slate-800">Paste Schedule / Assignment List</p>
                                <textarea 
                                    rows={4} 
                                    placeholder="Paste your syllabus or assignment list here..." 
                                    className="p-1 rounded-lg border border-gray-300 focus:outline-none w-full resize-none"
                                    onChange={(e) => setPasted(e.target.value)}                                    
                                    ></textarea>
                            </div>
                            
                            {/* Button to extract assignments */}
                            <div className="absolute right-6 -translate-y-1">
                                <button className="items-center p-2 rounded-xl bg-[#6182cd] text-white text-[15px] cursor-pointer hover:bg-slate-400" onClick={handleExtract}>Extract Assignments</button>
                            </div>
                        </div>)}
                    </div>}

                    
                    {/* Human verification card - shows when file or text is uploaded */}
                    {showVerify && <div className="bg-white absolute inset-0 m-auto z-60 p-4 max-w-[calc(35%)] h-fit rounded-2xl">
                        {/* Headers */}
                         <div className="flex justify-between pb-5">
                            <div>
                                <h1 className="font-semibold text-xl text-slate-800 pb-1">Review Extracted Assignments</h1>
                                <h3 className="text-slate-600 text-sm">We extracted the following assignments. Please review and confirm.</h3>
                            </div>
                            {/* button to close out of card, not sure if want this yet <button className="cursor-pointer text-2xl" onClick={() => setShowVerify(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg> 
                            </button> */}
                        </div>

                        {/* Course */}
                        {/* find whose id is selected course from courses and then display that name and number */}
                        <div> Course Name: {courses.find(course => course.id === selectedCourse)?.course_name || "idk" }</div>

                        {/* Table with all extracted assignments */}
                        <pre>
                            {JSON.stringify(extractedAssignments, null, 2)}
                        </pre>

                        {/* Summary */}

                        {/* Confirm and add button */}
                        <button onClick={handleAddBulkAssignments}>Confirm & Add Assignments</button>
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
                                        <th className="border-b border-gray-300 px-4 pt-1 pb-3 font-semibold text-slate-700 text-left">Due Time</th>
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
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700">{assignment.courses.course_number}</td>
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700">{assignment.type}</td>
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700 flex">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2 block h-5 w-5 min-h-[20px] min-w-[20px]">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                            </svg>

                                            {formatDate(assignment.due_date)}
                                        </td>
                                        <td className="border-b border-gray-200 px-4 py-1 text-slate-700">{formatTime(assignment.due_date)}</td>
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