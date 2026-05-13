import { cn } from "@/utils/cn";

interface ThinkingLoaderProps {
  loadingText?: string;
  className?: string;
}

export function ThinkingLoader({ loadingText, className }: ThinkingLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-8 p-8", className)}>
      <div className="relative flex justify-center items-center">
        {/* Spinning Outer Ring */}
        <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
        {/* Inner Pulsing Ring */}
        <div className="absolute animate-ping rounded-full h-24 w-24 border-2 border-purple-400 opacity-20"></div>
        {/* Avatar Image */}
        <div className="relative z-10 bg-[#0a0c10] rounded-full p-2 border border-white/10 shadow-xl">
          <img 
            src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" 
            alt="AI Thinking"
            className="rounded-full h-24 w-24 object-contain grayscale-[20%] brightness-110" 
          />
        </div>
      </div>
      
      {loadingText && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xl font-medium tracking-tight bg-gradient-to-r from-white via-purple-200 to-white/70 bg-clip-text text-transparent animate-pulse">
            {loadingText}
          </p>
          <div className="flex gap-1.5 backdrop-blur-sm bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThinkingLoader;
