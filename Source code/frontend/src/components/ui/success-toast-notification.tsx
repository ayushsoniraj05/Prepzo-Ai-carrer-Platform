"use client";

import React from "react";

export default function SuccessToast({ message, description, onClose }: { message: string, description?: string, onClose?: () => void }) {
    return (
        <div className="bg-white inline-flex items-start space-x-3 p-3 text-sm rounded border border-gray-300/60 shadow-xl min-w-[300px]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                <path d="M16.5 8.31V9a7.5 7.5 0 1 1-4.447-6.855M16.5 3 9 10.508l-2.25-2.25" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex flex-col flex-1">
                <p className="text-[#1A1A1A] font-medium leading-none mb-1">{message || "Successfully saved!"}</p>
                <p className="text-[#666666] text-xs">{description || "Operation completed successfully."}</p>
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
