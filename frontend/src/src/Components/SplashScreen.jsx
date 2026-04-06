import React from "react";
import { motion } from "framer-motion";
import genfitLogo from "../assets/GenFit_AI__Elevate_Your_Fitness-removebg-preview.png";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030014] overflow-hidden">
      {/* Dynamic Background Glowing Blobs and Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-[#8B5CF6] rounded-full blur-3xl opacity-25" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#22D3EE] rounded-full blur-3xl opacity-20" 
        />
        
        {/* Subdued Tech Grid Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />

        {/* Floating Sparks/Stars */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.2,
              scale: Math.random() * 0.6 + 0.4
            }}
            animate={{ 
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
            className={`absolute w-1 h-1 rounded-full filter pointer-events-none ${
              i % 2 === 0 ? "bg-[#8B5CF6] blur-[1px]" : "bg-[#22D3EE] blur-[1px]"
            }`}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ 
            duration: 1.5, 
            ease: [0.16, 1, 0.3, 1], // Custom bouncy ease
            delay: 0.2
          }}
          className="relative"
        >
          {/* Logo Glow Effect */}
          <div className="absolute inset-0 bg-[#8B5CF6] rounded-full blur-2xl opacity-20 animate-pulse" />
          
          <img 
            src={genfitLogo} 
            alt="GenFit AI" 
            className="w-64 h-64 sm:w-96 sm:h-96 object-contain relative z-10 drop-shadow-[0_0_50px_rgba(139,92,246,0.7)]"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
        className="mt-8 flex flex-col items-center"
      >
        <p className="text-gray-400 text-xs sm:text-sm tracking-[0.25em] font-semibold uppercase">
          Elevating Your Health
        </p>
        <div className="mt-4 w-40 h-1 bg-[#1F2937] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.5, duration: 1.2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
