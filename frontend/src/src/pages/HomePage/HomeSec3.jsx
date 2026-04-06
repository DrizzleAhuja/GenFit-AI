import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BarChart3, Database, Workflow, Clock, ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const HomeSec3 = ({ onLoginSuccess, onLoginError }) => {
  const features = [
    {
      title: "Verified Routines Only",
      desc: "Every exercise and plan is vetted against sports science literature. No clickbait routines — only programmes that actually work.",
      icon: <ShieldCheck className="text-emerald-400" size={24} />
    },
    {
      title: "Aligned with Fit India",
      desc: "Our platform is aligned with India's Fit India Movement, helping you meet ICMR-recommended weekly activity guidelines.",
      icon: <Workflow className="text-[#22D3EE]" size={24} />
    },
    {
      title: "Real-Time AI Coaching",
      desc: "MoveNet tracks 17 key body points at up to 30 FPS. Get instant posture feedback mid-rep — no expensive trainer required.",
      icon: <Brain className="text-[#FACC15]" size={24} />
    },
    {
      title: "Live Form Analytics",
      desc: "See joint angle data, rep count, and form score after every set — so you can correct and improve on the next rep.",
      icon: <BarChart3 className="text-[#22D3EE]" size={24} />
    },
    {
      title: "50+ Exercise Library",
      desc: "Browse a curated library of exercises by muscle group, equipment, and difficulty. Add any movement to your plan in one tap.",
      icon: <Database className="text-violet-400" size={24} />
    },
    {
      title: "Adaptive AI Plans",
      desc: "Your plan evolves with you. The AI recalibrates weights, reps, and rest days based on real performance data — not guesswork.",
      icon: <Clock className="text-rose-400" size={24} />
    }
  ];

  return (
    <section className="bg-[#05010d] py-24 relative">
      <div className="container mx-auto px-4 max-w-7xl">

        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-widest">Platform Features · 2026</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Built for serious results
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Every feature on GenFit AI exists for one reason: to help you train better, recover smarter, and stay consistent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-24">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="relative h-full p-6 sm:p-8 rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl flex flex-col shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-transform duration-300 hover:-translate-y-1.5 group"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-xl bg-[#020617] border border-[#1F2937] group-hover:border-[#22D3EE]/40 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 4-Step Onboarding */}
        <div className="border-t border-white/10 pt-24">
          <div className="mb-16 text-center lg:text-left">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">From sign-up to first session</h3>
            <p className="text-gray-500 max-w-xl">No complex onboarding. No hidden steps. Just a clean path to your first AI-coached workout.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[
              { step: "01", title: "Create Account", desc: "Sign up with Google in seconds. Your profile is auto-populated from Google Fit if you choose." },
              { step: "02", title: "AI Assessment", desc: "Enter your BMI, goals, and weekly availability. Our AI builds a structured base plan instantly." },
              { step: "03", title: "Customise Your Plan", desc: "Accept the generated plan or tweak exercises, frequency, and targets to match your lifestyle." },
              { step: "04", title: "Start Training", desc: "Open the Virtual Training Assistant and begin your first real-time AI-coached session today." }
            ].map((s, i) => (
              <motion.div
                key={i}
                className="relative h-full p-6 rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl flex flex-col shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-transform duration-300 hover:-translate-y-1.5 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
                <div className="text-7xl font-black text-white/[0.03] absolute -top-4 -right-2 select-none z-0">{s.step}</div>
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-[#020617] border border-[#1F2937] flex items-center justify-center mb-4">
                    <span className="text-xs font-bold text-[#22D3EE]">{s.step}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed flex-1">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 flex flex-col items-center justify-center gap-4">
            <h4 className="text-xl md:text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] tracking-wide">
              START FOR FREE TODAY
            </h4>
            <div className="shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-shadow duration-300 rounded-full">
              <GoogleOAuthProvider clientId="702465560392-1mu8j4kqafadep516m62oa5vf5klt7pu.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={onLoginSuccess}
                  onError={onLoginError}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  text="signup_with"
                  width="260px"
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HomeSec3;
