"use client";

import React from "react";
import toast, { Toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface CustomToastProps {
  t: Toast;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const SuccessToast = ({ t, title = "Successfully saved!", message }: CustomToastProps) => (
  <div 
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } bg-white inline-flex space-x-3 p-4 text-sm rounded-xl border border-gray-200 shadow-xl max-w-md w-full pointer-events-auto selection:bg-green-100 selection:text-green-900`}
  >
    <div className="flex-shrink-0 pt-0.5">
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.5 8.31V9a7.5 7.5 0 1 1-4.447-6.855M16.5 3 9 10.508l-2.25-2.25" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="flex-1">
        <h3 className="text-gray-900 font-bold tracking-tight">{title}</h3>
        <p className="text-gray-500 mt-1 leading-relaxed">{message}</p>
    </div>
    <button 
      onClick={() => toast.dismiss(t.id)}
      className="flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-1 active:scale-95 transition-all"
    >
      <span className="sr-only">Close</span>
      <X size={16} />
    </button>
  </div>
);

export const ErrorToast = ({ t, message }: CustomToastProps) => (
  <div 
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } flex items-center justify-between text-red-600 max-w-sm w-full bg-red-50 border border-red-100 rounded-lg overflow-hidden shadow-lg pointer-events-auto`}
  >
    <div className="h-full w-1.5 bg-red-600 self-stretch" />
    <div className="flex items-center py-3 px-4">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <path
          d="M11.95 16.5h.1"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.95}
        />
        <path
          d="M3 12a9 9 0 0 1 9-9h0a9 9 0 0 1 9 9h0a9 9 0 0 1-9 9h0a9 9 0 0 1-9-9m9 0V7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
      </svg>
      <p className="text-sm font-semibold ml-3 tracking-tight">{message}</p>
    </div>
    <button
      onClick={() => toast.dismiss(t.id)}
      className="active:scale-90 transition-all mr-3 text-red-400 hover:text-red-600 p-1"
    >
      <X size={18} />
    </button>
  </div>
);

export const InfoToast = ({ t, message }: CustomToastProps) => (
  <div 
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } flex items-center justify-between text-blue-600 max-w-sm w-full bg-blue-50 border border-blue-100 rounded-lg overflow-hidden shadow-lg pointer-events-auto`}
  >
    <div className="h-full w-1.5 bg-blue-600 self-stretch" />
    <div className="flex items-center py-3 px-4">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path
          style={{
            fill: "none",
            stroke: "currentColor",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 1.95,
          }}
          d="M11.95 16.5h.1"
        />
        <path
          d="M3 12a9 9 0 0 1 9-9h0a9 9 0 0 1 9 9h0a9 9 0 0 1-9 9h0a9 9 0 0 1-9-9m9 0V7"
          style={{
            fill: "none",
            stroke: "currentColor",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 1.5,
          }}
        />
      </svg>
      <p className="text-sm font-semibold ml-3 tracking-tight">{message}</p>
    </div>
    <button
      onClick={() => toast.dismiss(t.id)}
      className="active:scale-90 transition-all mr-3 text-blue-400 hover:text-blue-600 p-1"
    >
      <X size={18} />
    </button>
  </div>
);
