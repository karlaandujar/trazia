"use client";
import { useRouter } from "next/navigation";
import { getNav } from "../dashboard/page";
import { useState } from "react";


export default function Profile(){
    const router = useRouter();
    const [showSetProfile, setShowSetProfile] = useState(false);

    return (
        <div className={`${showSetProfile ? 'before:fixed before:absolute before:inset-0 before:z-50 before:bg-black/30' : '' }`}>
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden min-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)]">
                {/* Navigation bar */}
                { getNav() }

                <div className="flex gap-1 mx-2 px-16 pt-12 flex flex-col gap-8 bg-[url('/trazia_hero_bg.png')] min-h-[calc(100vh-7rem)] rounded-3xl bg-cover bg-position-[2%_20%]">
                    {/* Headers and course addition button */}
                    <div className="flex relative pt-6">
                        <div>
                            <h1 className="font-semibold text-3xl text-slate-800">My Profile</h1>
                            <h3 className="text-slate-700">Manage your account information and preferences</h3>
                        </div>
                    </div>

                    <div className="ml-[calc(5%)] bg-white rounded-xl py-3 border border-slate-300">
                        {/* Profile pic and general information */}
                        <div className="flex">
                            <img className="h-26 w-26 rounded-full cursor-pointer" src="/profile.png" onClick={() => setShowSetProfile(true)} alt="Profile"></img>
                            <div className="ml-5">
                                <h1>name</h1>
                                <h1>email</h1>
                                <h1>location • school</h1>
                                <h1>major • class of 20xx</h1>
                            </div>
                        </div>

                        {showSetProfile && (
                            <div className="fixed inset-0 bg-opacity-20 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-[calc(100%-2rem)] max-w-md">
                                    <h2 className="text-xl font-semibold mb-4">Set Profile Picture</h2>
                                    <input type="file" accept="image/*" className="mb-4" />
                                </div>
                                <p onClick={() => setShowSetProfile(false)} className="text-gray-500 hover:text-gray-700 text-size-lg cursor-pointer">x</p>
                            </div>
                        )}

                        {/* 2 cards for account info and preferences */}
                        <div className="flex justify-evenly mt-2 mb-1">
                            {/* Account info */}
                            <div className="border border-slate-300 rounded-lg w-[calc(50%-1rem)]">
                                <h1 className="ml-4 m-2">Account Information</h1>
                                <div className="ml-7">
                                    <p>full name</p>
                                    <p>email</p>
                                    <p>school</p>
                                    <p>major</p>
                                    <p>year/ class of XXXX </p>
                                    <p>timezone</p>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="border border-slate-300 rounded-lg w-[calc(50%-1rem)]">
                                <h1 className="ml-4 m-2">Preferences</h1>
                                <div className="ml-7">
                                    <p>theme</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}