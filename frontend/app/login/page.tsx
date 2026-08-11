"use client";
import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
    const [logEmail, setLogEmail] = useState("");
    const [signEmail, setSignEmail] = useState("");
    const [logPassword, setLogPassword] = useState("");
    const [signPassword, setSignPassword] = useState("");
    const [showVerif, setShowVerif] = useState(false);
    const [showAccCreate, setShowAccCreate] = useState(false);
    const router = useRouter();

    // Clear the input fields after successful login or signup
    const handleClear = (): void => {
        setLogEmail('');
        setLogPassword('');
        setSignEmail('');
        setSignPassword('');
    }

    // Handle user sign up and show verification card
    async function handleSignUp({}) {
        const { data, error } = await supabase.auth.signUp({
            email: signEmail,
            password: signPassword,
        });

        if (error) {
            console.log(error.message);
            return;
        }

        handleClear();
        setShowVerif(true);
    }

    // Handle user log in and redirect to dashboard
    async function handleLogin({ }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: logEmail,
            password: logPassword,
        });

        if (error) console.log(error.message);
        else {
            console.log(data);
            router.push("/dashboard");
            alert("Logged in!");
            handleClear();
        }
    }

    // Check if the user has verified their email every 5 seconds
    useEffect(() => {
        if (!showVerif) return;

        const interval = setInterval(async () => {
            const { error } = await supabase.auth.signInWithPassword({
                email: signEmail,
                password: signPassword,
            });

            if (error) {
                if (error.message!== "Email not confirmed") {
                    console.error(error.message);
                }
                return;
            }

            clearInterval(interval);
            router.push("/dashboard");
        }, 5000);

        return () => clearInterval(interval);
    }, [showVerif, signEmail, signPassword, router]);


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

                {/* Hero Section */}
                <div className="flex justify-between gap-1 px-16 py-12 grid grid-cols-2 bg-[url('/trazia_hero_bg.png')] bg-position-[65%_20%]">

                    {/* Left column */}
                    <div className="col-start-1">
                        <h1 className="font-semibold text-4xl pt-4 pl-4 text-slate-800">
                            Stay organized.
                        </h1>
                        <h1 className="font-semibold text-4xl pt-1 pl-4">
                            Stay <span className="text-[#3B719F]">ahead</span>.
                        </h1>
                        <h2 className="pl-4 pt-2 text-lg text-slate-600 max-w-md">
                            Upload your syllabus or course schedule and let AI organize your assignments, deadlines, and grades so you can focus on what matters most.
                        </h2>
                        {/* Features Section */}
                        <div className="flex gap-4 pt-6">
                            <div className="flex flex-col items-center text-center w-32">
                                <div className="flex size-12 items-center justify-center rounded-full bg-[#DCEBF5]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8 text-slate-700">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                </div>
                                
                                <p className="pt-2 leading-tight"> AI Syllabus Parsing </p>
                            </div>

                            <div className="flex flex-col items-center text-center w-32">
                                <div className="flex size-12 items-center justify-center rounded-full bg-[#DCEBF5]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                    </svg>
                                </div>
                                <p className="pt-2 leading-tight"> Assignment Tracking </p>
                            </div>

                            <div className="flex flex-col items-center text-center w-32">
                                <div className="flex size-12 items-center justify-center rounded-full bg-[#DCEBF5]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
                                    </svg>
                                </div>
                                <p className="pt-2 leading-tight"> Grade Calculation </p>
                            </div>

                        </div>
                    </div>

                    {/* Login Section */}
                    {!showAccCreate && (
                        <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md col-start-2 row-start-1">
                            <h3 className="font-semibold text-2xl text-slate-700 pt-1 pl-2"> Welcome back </h3>
                            <p className="text-sm text-slate-500 pl-2"> Sign in to continue your journey</p>

                            <p className="pl-2 mt-7 mb-1 font-semibold">Email</p>
                            <div className="relative">
                                <input 
                                    className="border border-gray-300 ml-1 p-2 w-[calc(100%-1rem)] rounded-xl focus:outline-none focus:border-slate-500" 
                                    type="text" 
                                    placeholder="Enter your email address..." 
                                    value={logEmail} 
                                    onChange={(e) => setLogEmail(e.target.value)} />
                                <div className="pointer-events-none absolute inset-y-0 right-[calc(1rem)] flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                            </div>

                            <p className="pl-2 mt-4 mb-1 font-semibold">Password</p>
                            <div className="relative">
                                <input 
                                    className="border border-gray-300 ml-1 p-2 w-[calc(100%-1rem)] rounded-xl focus:outline-none focus:border-slate-500" 
                                    type="password" 
                                    placeholder="Enter your password..." 
                                    value={logPassword} 
                                    onChange={(e) => setLogPassword(e.target.value)} />
                                    <div className="pointer-events-none absolute inset-y-0 right-[calc(1rem)] flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>

                                    </div>
                            </div>
                            <button className="p-2 ml-2 mt-7 w-[calc(100%-1rem)] rounded-2xl bg-[#8AB3D6] text-white font-semibold hover:bg-slate-400 border shadow-sm" onClick={handleLogin}>Log In</button>
                        
                            <p className="text-center text-gray-600 pt-2">Don't have an account? <span className="text-blue-500 hover:text-blue-700 cursor-pointer" onClick={() => setShowAccCreate(true)}>Create one</span></p>
                        </div>
                    )}

                    {/* Account Creation Section */}
                    {showAccCreate && (
                        <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md col-start-2 row-start-1">
                            <h3 className="font-semibold text-2xl text-slate-700 pt-1 pl-2"> Sign Up </h3>
                            <p className="text-sm text-slate-500 pl-2">Create an account to get started.</p>

                            <p className="pl-2 mt-7 mb-1 font-semibold">Email</p>
                            <div className="relative">
                                <input 
                                    className="border border-gray-300 ml-1 p-2 w-[calc(100%-1rem)] rounded-xl focus:outline-none focus:border-slate-500" 
                                    type="text" 
                                    placeholder="Enter your email address..." 
                                    value={signEmail} 
                                    onChange={(e) => setSignEmail(e.target.value)} />
                                <div className="pointer-events-none absolute inset-y-0 right-[calc(1rem)] flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                            </div>

                            <p className="pl-2 mt-4 mb-1 font-semibold">Password</p>
                            <div className="relative">
                                <input 
                                    className="border border-gray-300 ml-1 p-2 w-[calc(100%-1rem)] rounded-xl focus:outline-none focus:border-slate-500" 
                                    type="password" 
                                    placeholder="Create a password..." 
                                    value={signPassword} 
                                    onChange={(e) => setSignPassword(e.target.value)} />
                                <div className="pointer-events-none absolute inset-y-0 right-[calc(1rem)] flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                </div>
                            </div>
                            <button className="p-2 ml-2 mt-7 w-[calc(100%-1rem)] rounded-2xl bg-[#8AB3D6] text-white font-semibold hover:bg-slate-400 border shadow-sm" onClick={handleSignUp}>Sign Up</button>

                            <p className="text-center text-gray-600 pt-2">Already have an account? <span className="text-blue-500 hover:text-blue-700 cursor-pointer" onClick={() => setShowAccCreate(false)}>Log in</span></p>
                        </div>
                    )}

                </div>



                {showVerif && (
                    <div className="border p-4 bg-gray-100 max-w-md mx-auto shadow-lg w-full h-full">
                        <h2 className="text-xl font-bold mb-2 text-center"> Verify your email </h2>
                        <p> We've sent a verification link to {signEmail}. Please check your inbox and click the link to verify your account. </p>
                    </div>
                )}
            </div>
        </div>
    )
}