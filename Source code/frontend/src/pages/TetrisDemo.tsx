import { motion } from "framer-motion"
import TetrisLoading from "@/components/ui/tetris-loader"
import { GlassCard } from "@/components/ui/GlassCard"
import { Bot, Sparkles, Zap, Brain, Shield, Award } from "lucide-react"

export default function TetrisDemo() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-white p-8 md:p-20  selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 text-code-green mb-6"
          >
            <Zap size={24} />
            <span className="text-[12px] font-[900] uppercase tracking-[0.5em]">Visual Intelligence</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-[900] uppercase tracking-tighter italic leading-[0.85] mb-8"
          >
            The Tetris <br/>
            <span className="text-white/20">Protocol.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/40 max-w-2xl font-medium tracking-tight"
          >
            A high-fidelity async synchronization engine disguised as a B&W minimalist game loop. 
            Engineered for Prepzo's premium career surfaces.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Section 1: Assessment Loading */}
          <GlassCard className="rounded-[40px] p-10 bg-[#0a0c10]/60 border-white/5 flex flex-col items-center justify-between min-h-[400px]">
            <div className="text-center w-full">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 text-left">Signal Case: Assessment</p>
              <TetrisLoading 
                size="lg" 
                speed="normal" 
                loadingText="Synthesizing Test" 
              />
            </div>
            <div className="w-full pt-8 border-t border-white/5 flex items-center gap-3">
              <Shield className="text-white/20" size={18} />
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest italic">Mission Critical Flow</p>
            </div>
          </GlassCard>

          {/* Section 2: AI Mentor Thinking */}
          <GlassCard className="rounded-[40px] p-10 bg-[#0a0c10]/60 border-white/5 flex flex-col items-center justify-between min-h-[400px]">
            <div className="text-center w-full">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 text-left">Signal Case: AI Thinking</p>
              <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 text-left">
                    <TetrisLoading 
                        size="md" 
                        speed="fast" 
                        loadingText="Thinking..." 
                    />
                  </div>
              </div>
            </div>
            <div className="w-full pt-8 border-t border-white/5 flex items-center gap-3">
              <Brain className="text-white/20" size={18} />
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest italic">Contextual Reasoning</p>
            </div>
          </GlassCard>

          {/* Section 3: Resume Processing */}
          <GlassCard className="rounded-[40px] p-10 bg-[#0a0c10]/60 border-white/5 flex flex-col items-center justify-between min-h-[400px]">
            <div className="text-center w-full">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 text-left">Signal Case: Resume Lab</p>
              <TetrisLoading 
                size="md" 
                speed="normal" 
                loadingText="Extracting ATS Data" 
              />
            </div>
            <div className="w-full pt-8 border-t border-white/5 flex items-center gap-3">
              <Sparkles className="text-white/20" size={18} />
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest italic">Optimization Active</p>
            </div>
          </GlassCard>

          {/* Section 4: Small Inline Loaders */}
          <GlassCard className="rounded-[40px] p-10 bg-[#0a0c10]/60 border-white/5 flex flex-col items-center justify-between min-h-[400px]">
            <div className="text-center w-full">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 text-left">Signal Case: Tiny Inline</p>
              <div className="space-y-4">
                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-4 group hover:bg-white/10 transition-all">
                   <TetrisLoading size="sm" speed="fast" />
                   <span className="text-[12px] font-black uppercase tracking-widest text-white/60">Processing Apply...</span>
                </button>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[12px] font-black uppercase tracking-widest text-white/30 text-left">Verification Sync</span>
                    <TetrisLoading size="sm" speed="normal" />
                </div>
              </div>
            </div>
            <div className="w-full pt-8 border-t border-white/5 flex items-center gap-3">
              <Award className="text-white/20" size={18} />
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest italic">Granular Feedback</p>
            </div>
          </GlassCard>
        </div>

        <section className="mt-40 text-center pb-40">
           <h3 className="text-2xl font-[900] uppercase tracking-widest text-white/10 mb-10 italic">Core Tokenization</h3>
           <div className="flex flex-wrap justify-center gap-20">
              <div className="text-left">
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.6em] mb-4">Colorway</p>
                 <div className="flex gap-2">
                    <div className="w-12 h-12 bg-black border border-white/20 rounded-lg" />
                    <div className="w-12 h-12 bg-white rounded-lg" />
                 </div>
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.6em] mb-4">Typography</p>
                 <p className="text-3xl font-[900] italic tracking-tighter uppercase">Rubik ExtraBold</p>
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.6em] mb-4">Motion</p>
                 <p className="text-3xl font-[900] italic tracking-tighter uppercase">60FPS Canvas</p>
              </div>
           </div>
        </section>
      </div>
    </div>
  )
}
