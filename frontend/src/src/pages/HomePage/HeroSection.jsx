import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, ArrowRight, Zap, Trophy, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const HeroSection = () => {
  const { darkMode } = useTheme();

  return (
    <section className={`relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50'}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -left-1/4 top-0 w-96 h-96 ${darkMode ? 'bg-purple-600' : 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob`}></div>
        <div className={`absolute -right-1/4 top-0 w-96 h-96 ${darkMode ? 'bg-blue-600' : 'bg-blue-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000`}></div>
        <div className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-96 h-96 ${darkMode ? 'bg-indigo-600' : 'bg-indigo-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000`}></div>
      </div>

      {/* Dot pattern overlay */}
      <div className={`absolute inset-0 ${darkMode ? 'opacity-10' : 'opacity-20'}`} style={{
        backgroundImage: `radial-gradient(circle, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 py-16 sm:py-20 md:py-28 lg:py-36">
        <div className="text-center max-w-5xl mx-auto">
          
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20 mb-6 sm:mb-8 animate-fade-in-down">
            <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} animate-pulse`} />
            <span className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
              AI-Powered Fitness Revolution
            </span>
          </div>

          {/* Logo with animation */}
          <div className="flex justify-center items-center mb-6 sm:mb-8 animate-fade-in">
            <div className="relative">
              <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-green-500 to-blue-600'} rounded-full blur-2xl opacity-50 animate-pulse`}></div>
              <div className="relative flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/10">
                <Brain className={`w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${darkMode ? 'text-green-400' : 'text-green-600'} animate-pulse-slow`} />
                <Sparkles className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'} animate-spin-slow`} />
              </div>
            </div>
          </div>

          {/* Main Heading with gradient animation */}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight animate-fade-in-up px-4 sm:px-0`}>
            <span className={`inline-block bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? 'from-green-400 via-blue-500 to-purple-500' : 'from-green-600 via-blue-700 to-purple-700'} animate-gradient`}>
              GenFit AI
            </span>
            <br />
            <span className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Train Your Mind,
              <br className="sm:hidden" /> Optimize Your Life
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 px-4 sm:px-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Harness the power of AI to personalize your wellness journey, blending mental resilience with physical performance for a 
            <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}> balanced and fulfilling life</span>.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 px-4 animate-fade-in-up animation-delay-400">
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
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 md:gap-6 px-4 animate-fade-in-up animation-delay-600">
            <Link
              to="/signup"
              className={`group relative w-full sm:w-auto overflow-hidden flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all duration-300 shadow-2xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 hover:shadow-blue-500/50 text-white' 
                  : 'bg-gradient-to-r from-green-600 via-blue-700 to-purple-700 hover:shadow-blue-600/50 text-white'
              } hover:scale-105 hover:-translate-y-1`}
            >
              <span className="relative z-10 flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              to="/learn-more"
              className={`group w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 backdrop-blur-xl border-2 ${
                darkMode 
                  ? 'border-purple-500/50 text-white hover:bg-purple-500/10 hover:border-purple-400' 
                  : 'border-purple-600/50 text-gray-900 hover:bg-purple-600/10 hover:border-purple-600'
              } hover:scale-105 hover:-translate-y-1 shadow-lg`}
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className={`mt-12 sm:mt-16 md:mt-20 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 animate-fade-in-up animation-delay-800 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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

      {/* Bottom gradient fade */}
      <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${darkMode ? 'from-gray-900' : 'from-blue-50'} to-transparent`}></div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;