import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Users, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const steps = [
  {
    icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10" />,
    title: "Personalized AI Assessment",
    description:
      "GenFit AI learns your goals, schedule, and training history to build a plan that actually fits your real life.",
    gradient: "from-[#8B5CF6] to-[#22D3EE]",
    bgGradient: "from-[#8B5CF6]/10 to-[#22D3EE]/10",
  },
  {
    icon: <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />,
    title: "Train, Track & Adapt",
    description:
      "Every workout, meal, and habit updates your plan in real time with simple visuals that show if you're on track.",
    gradient: "from-[#22D3EE] to-[#0EA5E9]",
    bgGradient: "from-[#22D3EE]/10 to-[#0EA5E9]/10",
  },
  {
    icon: <Users className="w-8 h-8 sm:w-10 sm:h-10" />,
    title: "Stay Consistent, Hit Goals",
    description:
      "Gamified streaks, leaderboards, and gentle nudges keep you coming back until results feel automatic.",
    gradient: "from-[#8B5CF6] to-[#A855F7]",
    bgGradient: "from-[#8B5CF6]/10 to-[#A855F7]/10",
  },
];

const HomeSec3 = () => {
  const { darkMode } = useTheme();

  return (
    <section
      className={`relative overflow-hidden py-6 sm:py-8 lg:py-10 ${
        darkMode ? 'bg-[#05010d]' : 'bg-[#020617]'
      }`}
      style={{ marginTop: 0 }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#8B5CF6] rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/3 -right-20 w-64 h-64 bg-[#22D3EE] rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#A855F7] rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
            <span className="text-xs sm:text-sm font-semibold text-gray-100">
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
          
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
            GenFit AI turns your goals into a simple, repeatable weekly rhythm—so you always know what to do today and why it matters.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 relative mb-10 sm:mb-14">
          {steps.map((step, index) => (
            <article
              key={index}
              className="relative h-full rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 sm:p-8 flex flex-col shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              
              {/* Icon Container */}
              <div className="relative inline-flex items-center justify-center mb-6 sm:mb-8">
                <div className={`relative bg-gradient-to-br ${step.bgGradient} backdrop-blur-xl rounded-2xl p-4 sm:p-5`}>
                  <div className={`bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                    {step.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
                {step.title}
              </h3>

              <p className="text-sm sm:text-base leading-relaxed text-gray-300 flex-1">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-6 sm:p-8 rounded-2xl border border-[#22D3EE]/40 bg-gradient-to-r from-[#020617]/90 via-[#05010d]/90 to-[#020617]/90 backdrop-blur-xl">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                Ready to start your journey?
              </h3>
              <p className="text-sm sm:text-base text-gray-300">
                Join thousands of users already training with GenFit AI.
              </p>
            </div>
            <Link
              to="/signup"
              className="group px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-white bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:opacity-95 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSec3;
