import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, Sparkles, CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CallToAction() {
  const { darkMode } = useTheme();

  const benefits = [
    "Free 14-day trial",
    "No credit card required",
    "Cancel anytime"
  ];

  return (
    <section className={`relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50'}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${darkMode ? 'bg-purple-600' : 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob`}></div>
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${darkMode ? 'bg-blue-600' : 'bg-blue-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000`}></div>
        <div className={`absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-96 h-96 ${darkMode ? 'bg-indigo-600' : 'bg-indigo-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000`}></div>
      </div>

      {/* Decorative grid pattern */}
      <div className={`absolute inset-0 ${darkMode ? 'opacity-5' : 'opacity-10'}`} style={{
        backgroundImage: `radial-gradient(circle, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className={`relative backdrop-blur-xl rounded-3xl sm:rounded-[2.5rem] overflow-hidden border ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-purple-500/30' 
            : 'bg-gradient-to-br from-white/80 to-blue-50/80 border-purple-300/50'
        } shadow-2xl`}>
          
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          <div className="relative px-6 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
            
            {/* Floating badge */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30">
                <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'} animate-pulse`} />
                <span className={`text-xs sm:text-sm font-bold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                  Limited Time Offer
                </span>
              </div>
            </div>

            {/* Main heading */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Ready to Transform Your{' '}
                <span className={`inline-block bg-clip-text text-transparent bg-gradient-to-r ${
                  darkMode 
                    ? 'from-green-400 via-blue-500 to-purple-500' 
                    : 'from-green-600 via-blue-700 to-purple-700'
                } animate-gradient`}>
                  Wellness Journey?
                </span>
              </h2>
              
              <p className={`text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Join <span className="font-bold text-purple-500">GenFit AI</span> today and unlock personalized fitness, mindful living, and nutritional guidance all in one powerful platform.
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
                      : 'bg-white/80 border border-gray-200/50'
                  } shadow-lg`}
                >
                  <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-xs sm:text-sm md:text-base font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            

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
                      Active users
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
        
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
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
        
        .animate-shine {
          animation: shine 2s ease-in-out;
        }
      `}</style>
    </section>
  );
}