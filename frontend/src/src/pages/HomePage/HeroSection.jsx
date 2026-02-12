import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Trophy, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const HeroSection = () => {
  const { darkMode } = useTheme();

  return (
    <section className={`relative overflow-hidden ${
      darkMode 
        ? 'bg-gradient-to-br from-[#05010d] via-[#0B1020] to-[#020617]' 
        : 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#020617]'
    }`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -left-1/4 top-0 w-96 h-96 ${darkMode ? 'bg-purple-600' : 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-20`}></div>
        <div className={`absolute -right-1/4 top-0 w-96 h-96 ${darkMode ? 'bg-blue-600' : 'bg-blue-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-20`}></div>
        <div className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-96 h-96 ${darkMode ? 'bg-indigo-600' : 'bg-indigo-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-20`}></div>
      </div>

      {/* Dot pattern overlay */}
      <div className={`absolute inset-0 ${darkMode ? 'opacity-10' : 'opacity-20'}`} style={{
        backgroundImage: `radial-gradient(circle, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 py-16 sm:py-20 md:py-28 lg:py-36">
        <div className="text-left max-w-5xl">
          
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20 mb-6 sm:mb-8">
            <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
              AI-Powered Fitness Revolution
            </span>
          </div>

          {/* Main Heading */}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight`}>
            <span className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl ${darkMode ? 'text-white' : 'text-gray-100'}`}>
              Transform your training with
              <br className="hidden sm:block" />
              <span
                className={`block mt-1 bg-clip-text text-transparent bg-gradient-to-r ${
                  darkMode
                    ? 'from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]'
                    : 'from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]'
                }`}
              >
                intelligent, real-time AI coaching
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 max-w-3xl leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            GenFit AI watches your movements, tracks your progress, and adapts every workout so you can
            <span className={`font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}> train smarter, recover better,</span>
            and stay consistent—like having a 24/7 elite coach in your pocket.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12">
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full backdrop-blur-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-gray-200'}`}>
              <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Smart Workouts</span>
            </div>
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full backdrop-blur-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-gray-200'}`}>
              <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Goal Tracking</span>
            </div>
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full backdrop-blur-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-gray-200'}`}>
              <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Progress Insights</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
            <Link
              to="/signup"
              className={`group relative w-full sm:w-auto overflow-hidden flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-2xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:shadow-cyan-500/50 text-white' 
                  : 'bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:shadow-cyan-500/50 text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </span>
            </Link>
            
            <Link
              to="/learn-more"
              className={`group w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold backdrop-blur-xl border-2 ${
                darkMode 
                  ? 'border-[#8B5CF6]/60 text-white hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6]' 
                  : 'border-[#8B5CF6]/60 text-gray-100 hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6]'
              } shadow-lg`}
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className={`mt-12 sm:mt-16 md:mt-20 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 md:gap-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${darkMode ? 'border-gray-900 bg-gradient-to-br from-purple-500 to-blue-500' : 'border-white bg-gradient-to-br from-purple-400 to-blue-400'} flex items-center justify-center text-white text-xs font-bold`}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm sm:text-base font-medium">
                <span className="font-bold text-purple-400">10,000+</span> active users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`text-lg sm:text-xl ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>★</span>
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

export default HeroSection;