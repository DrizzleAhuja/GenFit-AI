import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Trophy, TrendingUp, Brain, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const HomeSec1 = () => {
  const { darkMode } = useTheme();

  return (
    <section className={`relative overflow-hidden py-6 sm:py-8 lg:py-10 ${
      darkMode ? 'bg-[#05010d]' : 'bg-[#020617]'
    }`}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-16 w-96 h-96 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-28 right-0 w-96 h-96 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#A855F7] rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-left max-w-5xl">
            {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
            <span className="text-xs sm:text-sm font-semibold text-gray-100">
              AI-Powered Fitness Revolution
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-3 sm:mb-4 leading-tight text-white">
            Transform your training with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
              intelligent, real-time AI coaching
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl leading-relaxed text-gray-300">
            GenFit AI watches your movements, tracks your progress, and adapts every workout so you can{" "}
            <span className="font-bold text-[#22D3EE]">train smarter, recover better,</span>
            {" "}and stay consistent—like having a 24/7 elite coach in your pocket.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#020617]/80 backdrop-blur-xl border border-[#1F2937]">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
              <span className="text-xs sm:text-sm font-medium text-gray-200">Smart Workouts</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#020617]/80 backdrop-blur-xl border border-[#1F2937]">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#22D3EE]" />
              <span className="text-xs sm:text-sm font-medium text-gray-200">Goal Tracking</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#020617]/80 backdrop-blur-xl border border-[#1F2937]">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5CF6]" />
              <span className="text-xs sm:text-sm font-medium text-gray-200">Progress Insights</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
            <Link
              to="/signup"
              className="group relative w-full sm:w-auto overflow-hidden flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-2xl bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:shadow-cyan-500/50 text-white"
            >
              <span className="relative z-10 flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </span>
            </Link>
            
            <Link
              to="/features"
              className="group w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold backdrop-blur-xl border-2 border-[#8B5CF6]/60 text-white hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6] shadow-lg"
            >
              Explore Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#020617] bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm sm:text-base font-medium">
                <span className="font-bold text-[#22D3EE]">10,000+</span> active users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-lg sm:text-xl text-[#FACC15]">★</span>
                ))}
              </div>
              <span className="text-sm sm:text-base font-medium">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSec1;
