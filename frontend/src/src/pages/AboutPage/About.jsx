import React from 'react';
import NavBar from '../HomePage/NavBar';
import Footer from '../HomePage/Footer';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, Brain, Target, Users, Heart, TrendingUp, Award } from 'lucide-react';

export default function About() {
  const { darkMode } = useTheme();
  
  const features = [
    {
      icon: <Brain className="w-7 h-7 text-[#22D3EE]" />,
      title: "AI-Powered Insights",
      description: "Personalized recommendations based on your unique health data and goals",
      tag: "Intelligence",
    },
    {
      icon: <Target className="w-7 h-7 text-[#8B5CF6]" />,
      title: "Custom Workouts",
      description: "Tailored exercise plans that adapt to your fitness level and preferences",
      tag: "Training",
    },
    {
      icon: <Heart className="w-7 h-7 text-[#22D3EE]" />,
      title: "Mindfulness & Meditation",
      description: "Guided sessions to reduce stress and improve mental clarity",
      tag: "Wellness",
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-[#8B5CF6]" />,
      title: "Nutrition Tracking",
      description: "Smart meal planning and nutritional insights for optimal health",
      tag: "Nutrition",
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Workouts Completed" },
    { value: "95%", label: "Satisfaction Rate" },
    { value: "24/7", label: "AI Support" }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${
      darkMode ? 'bg-[#05010d] text-white' : 'bg-[#020617] text-gray-100'
    }`}>
      <NavBar />
      
      <main className="flex-grow">
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          {/* Background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Header */}
            <header className="text-center mb-6 sm:mb-8 lg:mb-10">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
                <span className="text-xs sm:text-sm font-semibold text-gray-100">
                  Our story
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                About{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                  GenFit AI
                </span>
              </h1>

              <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-gray-300">
                Revolutionizing personal wellness through intelligent, data-driven solutions designed for real-world results.
              </p>
            </header>

            {/* Mission Statement */}
            <div className="mb-12 sm:mb-16">
              <div className="rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 sm:p-8 lg:p-12 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">
                      Our Mission
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg leading-relaxed mb-4 text-gray-300">
                      We empower individuals to achieve optimal mental and physical health through personalized guidance, cutting-edge AI technology, and a supportive community.
                    </p>
                    <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-gray-300">
                      Our platform integrates innovative solutions to help you build sustainable habits for a balanced and fulfilling life.
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-full h-48 sm:h-56 lg:h-64 rounded-xl flex items-center justify-center text-6xl sm:text-7xl lg:text-8xl bg-gradient-to-br from-[#020617] via-[#05010d] to-[#020617] border border-[#1F2937]">
                      🎯
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-white">
                What We Offer
              </h2>
              <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, idx) => (
                  <article
                    key={feature.title}
                    className="relative h-full rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-5 sm:p-6 flex flex-col shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-transform duration-300 hover:-translate-y-1.5"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#020617] border border-[#1F2937]">
                          {feature.icon}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                        {feature.tag}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-300 flex-1">
                      {feature.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-10 sm:mb-14">
              <div className="rounded-2xl border border-[#1F2937] bg-gradient-to-r from-[#020617] via-[#020617] to-[#020617] backdrop-blur-xl px-5 sm:px-8 py-6 sm:py-7 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-white">
                  GenFit AI by the Numbers
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm sm:text-base lg:text-lg text-gray-300">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <section className="text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-5 rounded-2xl border border-[#22D3EE]/40 bg-gradient-to-r from-[#020617]/90 via-[#05010d]/90 to-[#020617]/90 px-6 sm:px-8 py-6 sm:py-7 backdrop-blur-xl">
                <div className="text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                    Ready to Transform Your Life?
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 max-w-md">
                    Join thousands of users who are already on their journey to better health and wellness.
                  </p>
                </div>
                <button className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:opacity-95 transition-all duration-300 shadow-lg hover:shadow-[#22D3EE]/40">
                  Get Started Today
                  <Award className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </section>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
