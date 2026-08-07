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
        <div>
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

            <div>
                <h1 className="font-semibold text-3xl pt-4 pl-4">
                    Stay organized.
                </h1>
                <h1 className="font-semibold text-3xl pt-1 pl-4">
                    Stay ahead.
                </h1>
                <h2 className="pl-4 pt-2"> Please log in or sign up for an account. </h2>
            </div>

            <div>
                <h3 className="font-bold text-xl pt-7 pl-4"> Log In </h3>
                <input className="border ml-4 p-2" type="text" placeholder="Email" value={logEmail} onChange={(e) => setLogEmail(e.target.value)} />
                <input className="border ml-1 p-2" type="password" placeholder="Password" value={logPassword} onChange={(e) => setLogPassword(e.target.value)} />
                <button className="p-2 ml-3 rounded hover:bg-blue-200 border" onClick={handleLogin}>Log In</button>
            </div>

            <div>
                <h3 className="font-bold text-xl pt-7 pl-4"> Sign Up </h3>
                <input className="border ml-4 p-2" type="text" placeholder="Email" value={signEmail} onChange={(e) => setSignEmail(e.target.value)} />
                <input className="border ml-1 p-2" type="password" placeholder="Password" value={signPassword} onChange={(e) => setSignPassword(e.target.value)} />
                <button className="p-2 ml-3 rounded hover:bg-blue-200 border" onClick={handleSignUp}>Sign Up</button>
            </div>

            {showVerif && (
                <div className="border p-4 bg-gray-100 max-w-md mx-auto shadow-lg w-full h-full">
                    <h2 className="text-xl font-bold mb-2 text-center"> Verify your email </h2>
                    <p> We've sent a verification link to {signEmail}. Please check your inbox and click the link to verify your account. </p>
                </div>
            )}
        </div>
    )
}