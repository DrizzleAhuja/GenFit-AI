import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Brain, TrendingUp, Users, ArrowRight, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10" />,
    title: "Personalized AI Assessment",
    description: "Our intelligent AI analyzes your unique goals and preferences to create a tailored wellness plan just for you.",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    number: "01"
  },
  {
    icon: <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />,
    title: "Track & Progress Smarter",
    description: "Effortlessly log your activities, nutrition, and mindfulness sessions. Watch your progress unfold with intuitive analytics.",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/10 to-emerald-500/10",
    number: "02"
  },
  {
    icon: <Users className="w-8 h-8 sm:w-10 sm:h-10" />,
    title: "Achieve Your Wellness Goals",
    description: "Follow your personalized plan, stay motivated with our community, and achieve sustainable results for a healthier mind and body.",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10",
    number: "03"
  },
];

export default function HowItWorks() {
  const { darkMode } = useTheme();

  return (
    <section className={`relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20' : 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30'}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 -left-20 w-64 h-64 ${darkMode ? 'bg-purple-600' : 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob`}></div>
        <div className={`absolute top-1/3 -right-20 w-64 h-64 ${darkMode ? 'bg-blue-600' : 'bg-blue-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000`}></div>
        <div className={`absolute bottom-1/4 left-1/2 w-64 h-64 ${darkMode ? 'bg-indigo-600' : 'bg-indigo-300'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000`}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20 mb-4 sm:mb-6">
            <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'} animate-pulse`} />
            <span className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
              Simple 3-Step Process
            </span>
          </div>
          
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            How <span className={`bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? 'from-green-400 via-blue-500 to-purple-500' : 'from-green-600 via-blue-700 to-purple-700'}`}>
              GenFit AI
            </span> Works
          </h2>
          
          <p className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Transform your wellness journey in three simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 relative">
          {/* Connection Lines for Desktop */}
         
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Mobile Arrow */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <ArrowRight className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'} animate-bounce`} style={{ animationDirection: 'alternate' }} />
                </div>
              )}

              {/* Card */}
              <div className={`relative h-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl border transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                darkMode 
                  ? 'bg-gray-800/40 border-gray-700/50 hover:border-purple-500/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20' 
                  : 'bg-white/60 border-gray-200/50 hover:border-purple-400/50 shadow-lg hover:shadow-xl hover:shadow-purple-400/20'
              }`}>
                
                {/* Number Badge */}
                <div className={`absolute -top-4 -right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg`}>
                  {step.number}
                </div>

                {/* Icon Container with Gradient Background */}
                <div className={`relative inline-flex items-center justify-center mb-6 sm:mb-8`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                  <div className={`relative bg-gradient-to-br ${step.bgGradient} backdrop-blur-xl rounded-2xl p-4 sm:p-5 border ${darkMode ? 'border-white/10' : 'border-gray-200/50'}`}>
                    <div className={`bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {step.title}
                </h3>
                
                <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step.description}
                </p>

                {/* Decorative Bottom Element */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient} rounded-b-2xl sm:rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16 md:mt-20">
          <div className={`inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl border ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30' 
              : 'bg-gradient-to-r from-purple-100/60 to-blue-100/60 border-purple-300/50'
          }`}>
            <div className="text-center sm:text-left">
              <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Ready to start your journey?
              </h3>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Join thousands of users transforming their lives
              </p>
            </div>
            <button className={`group px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 whitespace-nowrap`}>
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
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
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}