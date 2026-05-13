import { GridBeam } from "@/components/ui/background-grid-beam";
import { motion } from "framer-motion";

export default function TailwindAwesomeDemo() {
  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[600px] rounded-[40px] overflow-hidden border border-white/5 relative">
        <GridBeam className="flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10"
          >
            <h1 className="text-5xl md:text-8xl font-[900] text-white tracking-tighter mb-4">
              Tailwind is Awesome
            </h1>
            <p className="text-xl md:text-2xl text-white/40 font-medium tracking-tight">
              Framer motion is the best animation library ngl
            </p>
          </motion.div>
        </GridBeam>
      </div>
    </div>
  );
}
