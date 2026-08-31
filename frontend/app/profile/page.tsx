"use client";
import { useRouter } from "next/navigation";
import { getNav } from "../dashboard/page";


export default function Profile(){
    const router = useRouter();

    return (
        <div>
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
                            <img className="h-26 w-26 rounded-full cursor-pointer" src="/profile.png" alt="Profile"></img>
                            <div className="ml-5">
                                <h1>name</h1>
                                <h1>email</h1>
                                <h1>location • school</h1>
                                <h1>major • class of 20xx</h1>
                            </div>
                        </div>

                        {/* 2 cards for account info and preferences */}
                        <div className="flex justify-evenly">
                            {/* Account info */}
                            <div className="border border-slate-300 rounded-lg">
                                <h1>Account Information</h1>
                            </div>

                            {/* Preferences */}
                            <div className="border border-slate-300 rounded-lg">
                                <h1>Preferences</h1>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}