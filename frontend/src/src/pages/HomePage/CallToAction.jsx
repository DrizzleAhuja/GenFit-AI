import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CallToAction() {
  const { darkMode } = useTheme();

  const benefits = [
    "Evidence-based training and recovery plans",
    "Built for busy professionals and students",
    "Clear daily checklist—no guesswork",
  ];

  return (
    <section className={`relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden ${
      darkMode
        ? 'bg-gradient-to-br from-[#05010d] via-[#0B1020] to-[#020617]'
        : 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#020617]'
    }`} style={{ marginTop: 0 }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B5CF6] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#22D3EE] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#0EA5E9] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Decorative grid pattern */}
      <div
        className={`absolute inset-0 ${darkMode ? 'opacity-5' : 'opacity-10'}`}
        style={{
          backgroundImage: `radial-gradient(circle, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div
          className={`relative backdrop-blur-xl rounded-3xl sm:rounded-[2.5rem] overflow-hidden ${
            darkMode
              ? 'bg-gradient-to-br from-[#020617]/85 via-[#05010d]/85 to-[#020617]/85'
              : 'bg-gradient-to-br from-[#020617]/85 via-[#020617]/85 to-[#020617]/85'
          } shadow-2xl`}
        >
          
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          <div className="relative px-6 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
            
            {/* Floating badge */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#22D3EE]" />
                <span className="text-xs sm:text-sm font-semibold text-gray-100 tracking-wide">
                  Built for real-world routines
                </span>
              </div>
            </div>

            {/* Main heading */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight text-gray-100">
                Turn your health plan into{" "}
                <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] animate-gradient">
                  a weekly system that sticks
                </span>
                .
              </h2>
              
              <p
                className={`text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed ${
                  darkMode ? "text-gray-300" : "text-gray-200"
                }`}
              >
                <span className="font-bold text-[#22D3EE]">GenFit AI</span> gives you one place to manage training,
                recovery, sleep, and nutrition—with clear daily actions instead of endless scrolling and guessing.
              </p>
            </div>

            {/* Benefits grid */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full backdrop-blur-xl ${
                    darkMode 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-white/90 border border-gray-200/50'
                  } shadow-lg`}
                >
                  <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-xs sm:text-sm md:text-base font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold text-white bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:opacity-95 transition-all duration-300 shadow-xl hover:shadow-[#22D3EE]/40 hover:-translate-y-0.5"
              >
                Start free with GenFit AI
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/features"
                className={`inline-flex items-center justify-center px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-medium border ${
                  darkMode
                    ? 'border-gray-600 text-gray-100 hover:bg-gray-900/60'
                    : 'border-gray-400 text-gray-100 hover:bg-white/10'
                } transition-all duration-300`}
              >
                View all features
              </Link>
            </div>

            {/* Trust indicators */}
            <div className={`mt-10 sm:mt-12 md:mt-16 pt-8 sm:pt-10 border-t ${darkMode ? 'border-gray-700/50' : 'border-gray-300/50'}`}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
                {/* Users count */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                          darkMode ? 'border-gray-900 bg-gradient-to-br from-purple-500 to-blue-500' : 'border-white bg-gradient-to-br from-purple-400 to-blue-400'
                        } flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      10,000+
                    </div>
                    <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      People building healthier habits
                    </div>
                  </div>
                </div>

               
               

               
              </div>
            </div>
          </div>
        </div>
      </div>

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
      `}</style>
    </section>
  );
}