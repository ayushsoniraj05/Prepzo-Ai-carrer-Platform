"use client";

import React from "react";

export default function ErrorToast({ message, description, onClose }: { message: string, description?: string, onClose?: () => void }) {
    return (
        <div className="bg-white inline-flex items-start space-x-3 p-3 text-sm rounded border border-red-300/60 shadow-xl min-w-[300px]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                <circle cx="9" cy="9" r="7.5" stroke="#EF4444" strokeWidth="1.5" />
                <path d="M9 6v3M9 12h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col flex-1">
                <p className="text-[#1A1A1A] font-medium leading-none mb-1">{message || "Action Failed"}</p>
                <p className="text-[#666666] text-xs">{description || "Something went wrong. Please try again."}</p>
            </div>
            {onClose && (
                <button onClick={onClose} className="bg-transparent border-0 cursor-pointer flex items-center justify-center p-0 hover:opacity-70 transition-opacity">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.5 4.5l-9 9m0-9l9 9" stroke="#999999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
        </div>
    );
}
