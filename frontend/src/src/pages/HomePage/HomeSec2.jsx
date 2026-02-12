import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle, Target, Clock, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const HomeSec2 = () => {
  const { darkMode } = useTheme();

  const benefits = [
    {
      icon: <Target className="w-5 h-5 text-[#22D3EE]" />,
      text: "Evidence-based training and recovery plans",
    },
    {
      icon: <Clock className="w-5 h-5 text-[#8B5CF6]" />,
      text: "Built for busy professionals and students",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-[#FACC15]" />,
      text: "Clear daily checklist—no guesswork",
    },
  ];

  return (
    <section className={`relative overflow-hidden py-6 sm:py-8 lg:py-10 ${
      darkMode ? 'bg-[#05010d]' : 'bg-[#020617]'
    }`} style={{ marginTop: 0 }}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B5CF6] rounded-full blur-3xl opacity-20" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#22D3EE] rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#A855F7] rounded-full blur-3xl opacity-15" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="relative rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
          {/* Top gradient bar */}
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
          
          {/* Badge */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
              <span className="text-xs sm:text-sm font-semibold text-gray-100">
                Built for real-world routines
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight text-white">
              Turn your health plan into{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                a weekly system that sticks
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-300">
              <span className="font-bold text-[#22D3EE]">GenFit AI</span> gives you one place to manage training,
              recovery, sleep, and nutrition—with clear daily actions instead of endless scrolling and guessing.
            </p>
          </div>

          {/* Benefits grid */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[#020617]/80 backdrop-blur-xl border border-[#1F2937] shadow-lg"
              >
                {benefit.icon}
                <span className="text-xs sm:text-sm md:text-base font-medium text-gray-200">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold text-white bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:opacity-95 shadow-xl hover:shadow-[#22D3EE]/40"
            >
              Start free with GenFit AI
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/features"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-medium border border-[#1F2937] text-gray-100 hover:bg-[#020617]/60 transition-all"
            >
              View all features
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 sm:mt-12 md:mt-16 pt-8 sm:pt-10 border-t border-[#1F2937]">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#020617] bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center text-white text-xs font-bold shadow-lg"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-lg sm:text-xl font-bold text-white">
                    10,000+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    People building healthier habits
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSec2;
