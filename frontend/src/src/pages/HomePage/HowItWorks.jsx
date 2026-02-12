import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Brain, TrendingUp, Users, ArrowRight, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10" />,
    title: "Personalized AI Assessment",
    description:
      "GenFit AI learns your goals, schedule, and training history to build a plan that actually fits your real life.",
    gradient: "from-[#8B5CF6] to-[#22D3EE]",
    bgGradient: "from-[#8B5CF6]/10 to-[#22D3EE]/10",
    number: "01",
  },
  {
    icon: <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />,
    title: "Train, Track & Adapt",
    description:
      "Every workout, meal, and habit updates your plan in real time with simple visuals that show if you’re on track.",
    gradient: "from-[#22D3EE] to-[#0EA5E9]",
    bgGradient: "from-[#22D3EE]/10 to-[#0EA5E9]/10",
    number: "02",
  },
  {
    icon: <Users className="w-8 h-8 sm:w-10 sm:h-10" />,
    title: "Stay Consistent, Hit Goals",
    description:
      "Gamified streaks, leaderboards, and gentle nudges keep you coming back until results feel automatic.",
    gradient: "from-[#8B5CF6] to-[#A855F7]",
    bgGradient: "from-[#8B5CF6]/10 to-[#A855F7]/10",
    number: "03",
  },
];

export default function HowItWorks() {
  const { darkMode } = useTheme();

  return (
    <section
      className={`relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden ${
        darkMode
          ? "bg-gradient-to-br from-[#05010d] via-[#0B1020] to-[#020617]"
          : "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#020617]"
      }`}
      style={{ marginTop: 0 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#8B5CF6] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-64 h-64 bg-[#22D3EE] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-[#0EA5E9] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-slate-900/70 backdrop-blur-xl border border-white/10 mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FBBF24]" />
            <span className="text-xs sm:text-sm font-semibold text-[#E5E7EB] tracking-wide">
              From onboarding to daily execution
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-white">
            How{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
              GenFit AI
            </span>{" "}
            works for you
          </h2>
          
          <p
            className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto ${
              darkMode ? "text-gray-300" : "text-gray-200"
            }`}
          >
            GenFit AI turns your goals into a simple, repeatable weekly rhythm—so you always know what to do today and why it matters.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Mobile Arrow */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <ArrowRight className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'} animate-bounce`} style={{ animationDirection: 'alternate' }} />
                </div>
              )}

              {/* Card */}
              <div
                className={`relative h-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl transition-all duration-500 hover:translate-y-[-6px] ${
                  darkMode
                    ? "bg-slate-900/70 shadow-[0_18px_45px_rgba(15,23,42,0.8)]"
                    : "bg-slate-900/70 shadow-[0_18px_45px_rgba(15,23,42,0.8)]"
                }`}
              >
                {/* Icon Container with Gradient Background */}
                <div className="relative inline-flex items-center justify-center mb-6 sm:mb-8">
                  <div
                    className={`relative bg-gradient-to-br ${step.bgGradient} backdrop-blur-xl rounded-2xl p-4 sm:p-5`}
                  >
                    <div className={`bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
                  {step.title}
                </h3>

                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    darkMode ? "text-gray-300" : "text-gray-200"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16 md:mt-20">
          <div
            className={`inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl border ${
              darkMode
                ? "bg-gradient-to-r from-[#020617]/80 via-[#05010d]/80 to-[#020617]/80 border-[#22D3EE]/40"
                : "bg-gradient-to-r from-[#020617]/80 via-[#020617]/80 to-[#020617]/80 border-[#22D3EE]/40"
            }`}
          >
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                Ready to start your journey?
              </h3>
              <p
                className={`text-sm sm:text-base ${
                  darkMode ? "text-gray-300" : "text-gray-300"
                }`}
              >
                Join thousands of users already training with GenFit AI.
              </p>
            </div>
            <button className="group px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-white bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:opacity-95 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 whitespace-nowrap">
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