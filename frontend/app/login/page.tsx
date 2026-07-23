"use client";
import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";

export default function Login() {
    const [logEmail, setLogEmail] = useState("");
    const [signEmail, setSignEmail] = useState("");
    const [logPassword, setLogPassword] = useState("");
    const [signPassword, setSignPassword] = useState("");

    // Clear the input fields after successful login or signup
    const handleClear = (): void => {
        setLogEmail('');
        setLogPassword('');
        setSignEmail('');
        setSignPassword('');
    }

    async function handleSignUp({}) {
        const { data, error } = await supabase.auth.signUp({
            email: signEmail,
            password: signPassword,
        });

        if (error) console.log(error.message);
        else {
            console.log(data);
            alert("Account created!");
            handleClear();
        }
    }

    async function handleLogin({ }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: logEmail,
            password: logPassword,
        });

        if (error) console.log(error.message);
        else {
            console.log(data);
            alert("Logged in!");
            handleClear();
        }
    }


    return(
        <div>
            <div>
                <h1>
                    Welcome to the Trazia App!
                </h1>
                <h2> Please log in or sign up. </h2>
            </div>

            <div>
                <h3> Log In </h3>
                <input type="text" placeholder="Email" value={logEmail} onChange={(e) => setLogEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={logPassword} onChange={(e) => setLogPassword(e.target.value)} />
                <button onClick={handleLogin}>Log In</button>
            </div>

            <div>
                <h3> Sign Up </h3>
                <input type="text" placeholder="Email" value={signEmail} onChange={(e) => setSignEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={signPassword} onChange={(e) => setSignPassword(e.target.value)} />
                <button onClick={handleSignUp}>Sign Up</button>
            </div>

            
        </div>
    )
}