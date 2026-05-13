import React from 'react';
import { QuestionBank } from '@/components/interview/QuestionBank';
import { Layout } from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0c10] pt-24 px-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="relative overflow-hidden rounded-[40px] p-10 md:p-14 bg-black border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Layout size={200} />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-7xl font-[900] text-white uppercase tracking-tighter italic mb-4">
              Question <span className="text-white/40">Bank.</span>
            </h1>
            <p className="text-white/40 text-sm font-medium tracking-tight max-w-2xl italic leading-relaxed">
              The complete repository of interview questions across all technical and behavioral domains. 
              Use filters to narrow down your focus and prepare for elite placements.
            </p>
          </div>
        </div>

        <div className="p-1 border border-white/5 rounded-[40px] bg-black shadow-2xl relative">
          <QuestionBank />
        </div>
      </div>
    </div>
  );
};
