import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkoutScene = ({ size = 'large' }) => {
  const [reps, setReps] = useState(1);
  const [feedback, setFeedback] = useState('Good form');
  
  // Animation cycle for reps and feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setReps(prev => (prev % 3) + 1);
    }, 2500); // Matches the arm animation duration

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (reps === 1) setFeedback('Good form');
    if (reps === 2) setFeedback('Perfect rep');
    if (reps === 3) setFeedback('Keep it up!');
  }, [reps]);

  const isLarge = size === 'large';
  const width = isLarge ? 600 : 400;
  const height = isLarge ? 600 : 400;

  return (
    <div className="relative flex items-center justify-center select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 via-transparent to-transparent blur-[100px] rounded-full" />
      
      <svg
        width={width}
        height={height}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="skeletonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Holographic Scanner Effect */}
        <motion.line
          x1="50"
          x2="350"
          stroke="rgba(34, 211, 238, 0.4)"
          strokeWidth="1.5"
          animate={{ y: [80, 280, 80] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          style={{ filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.6))" }}
        />

        {/* Tracking Status Label */}
        <motion.g 
          initial={{ opacity: 0 }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <rect x="250" y="30" width="100" height="20" rx="10" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="0.5" />
          <text x="300" y="43" textAnchor="middle" fill="#10B981" className="text-[8px] font-black uppercase tracking-widest">Tracking: Active</text>
        </motion.g>

        {/* Robot Head Over Skeleton */}
        <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <rect x="175" y="55" width="50" height="50" rx="14" fill="#0F172A" stroke="url(#skeletonGrad)" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 15px rgba(139, 92, 246, 0.3))" }} />
            {/* Visor with Scanning Sensor */}
            <rect x="180" y="70" width="40" height="15" rx="4" fill="#1E293B" />
            <motion.rect 
              x="180" y="70" width="2" height="15" fill="#22D3EE" filter="url(#glow)"
              animate={{ x: [0, 38, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.rect 
              x="185" y="75" width="30" height="5" rx="2" fill="#22D3EE" opacity="0.3"
            />
            {/* AI Eye */}
            <circle cx="200" cy="77.5" r="1.5" fill="#22D3EE" filter="url(#glow)" />
        </motion.g>

        {/* AI Skeleton Overlay (Animated) */}
        <line x1="200" y1="105" x2="200" y2="250" stroke="url(#skeletonGrad)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
        
        {/* Joints (Shoulder) with Glow Depth */}
        <g>
          <circle cx="200" cy="140" r="10" fill="#22D3EE" opacity="0.05" />
          <circle cx="200" cy="140" r="4" fill="#22D3EE" filter="url(#glow)" />
        </g>

        {/* Left Arm Animation (Bicep Curl) */}
        <motion.g
          animate={{ rotate: [0, -45, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '200px', originY: '140px' }}
        >
          {/* Upper Arm Line */}
          <line x1="200" y1="140" x2="150" y2="180" stroke="url(#skeletonGrad)" strokeWidth="3" filter="url(#glow)" strokeLinecap="round" />
          
          {/* Joint (Elbow) */}
          <g>
            <circle cx="150" cy="180" r="10" fill="#22D3EE" opacity="0.05" />
            <circle cx="150" cy="180" r="4" fill="#22D3EE" filter="url(#glow)" />
          </g>
          
          <motion.g
            animate={{ rotate: [0, -80, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: '150px', originY: '180px' }}
          >
            {/* Lower Arm Line */}
            <line x1="150" y1="180" x2="120" y2="100" stroke="url(#skeletonGrad)" strokeWidth="3" filter="url(#glow)" strokeLinecap="round" />
            {/* Joint (Wrist) */}
            <g>
              <circle cx="120" cy="100" r="10" fill="#22D3EE" opacity="0.05" />
              <circle cx="120" cy="100" r="4" fill="#22D3EE" filter="url(#glow)" />
            </g>
            
            {/* Dumbbell with Glow */}
            <g transform="translate(120, 100) rotate(15)">
              <rect x="-30" y="-5" width="60" height="10" rx="2" fill="#334155" style={{ filter: "drop-shadow(0 0 5px rgba(0,0,0,0.5))" }} />
              <rect x="-35" y="-15" width="12" height="30" rx="4" fill="#0F172A" stroke="url(#skeletonGrad)" strokeWidth="1" />
              <rect x="23" y="-15" width="12" height="30" rx="4" fill="#0F172A" stroke="url(#skeletonGrad)" strokeWidth="1" />
            </g>

            {/* Angle Indicator (Arc) */}
            <motion.path
               d="M 150 180 L 175 180 A 25 25 0 0 1 165 155 Z"
               stroke="#FACC15"
               strokeWidth="1"
               fill="rgba(250, 204, 21, 0.1)"
               animate={{ opacity: [0.2, 0.6, 0.2] }}
               transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.g>
        </motion.g>

        {/* Right Arm (Stationary Hologram) */}
        <g opacity="0.2">
          <line x1="200" y1="140" x2="250" y2="180" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="250" y1="180" x2="280" y2="250" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
        </g>
      </svg>

      {/* Rep Counter UI Overlay */}
      <div className="absolute top-10 right-10 bg-[#020617]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-20">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 text-center">Reps Completed</div>
        <motion.div 
          key={reps}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-black text-[#10B981] text-center tracking-tighter"
        >
          {reps}
        </motion.div>
      </div>

      {/* AI Feedback Popups */}
      <AnimatePresence mode="wait">
        <motion.div
           key={feedback}
           initial={{ opacity: 0, y: 10, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: -10, scale: 0.9 }}
           className="absolute bottom-20 right-0 bg-[#3B82F6]/10 border border-[#3B82F6]/30 backdrop-blur-xl px-4 py-2 rounded-full z-30"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[11px] font-black text-white uppercase tracking-wider">{feedback}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Joint Data */}
      <motion.div
        className="absolute bottom-32 left-10 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Elbow Angle</div>
        <div className="text-sm font-black text-[#22D3EE]">142.5°</div>
      </motion.div>
    </div>
  );
};

export default WorkoutScene;
