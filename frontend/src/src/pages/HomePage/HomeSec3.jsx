import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BarChart3, Database, Workflow, Clock, ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomeSec3 = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="p-8 rounded-3xl bg-[#020617] border border-white/5 hover:border-[#22D3EE]/40 transition-all group relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#22D3EE]/0 to-transparent group-hover:from-[#22D3EE]/5 transition-all duration-500 rounded-3xl" />
              <div className="mb-6 p-4 rounded-2xl bg-white/5 inline-block group-hover:bg-[#22D3EE]/10 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-tight">
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up with Google in seconds. Your profile is auto-populated from Google Fit if you choose." },
              { step: "02", title: "AI Assessment", desc: "Enter your BMI, goals, and weekly availability. Our AI builds a structured base plan instantly." },
              { step: "03", title: "Customise Your Plan", desc: "Accept the generated plan or tweak exercises, frequency, and targets to match your lifestyle." },
              { step: "04", title: "Start Training", desc: "Open the Virtual Training Assistant and begin your first real-time AI-coached session today." }
            ].map((s, i) => (
              <motion.div
                key={i}
                className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#22D3EE]/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-6xl font-black text-white/5 absolute -top-4 -right-2 select-none">{s.step}</div>
                <div className="relative z-10">
                  <div className="w-8 h-8 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center mb-4">
                    <span className="text-xs font-black text-[#22D3EE]">{s.step}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 flex justify-center">
            <Link
              to="/signup"
              className="px-10 py-5 rounded-full bg-[#22D3EE] text-[#05010d] font-black text-lg hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_20px_50px_rgba(34,211,238,0.25)]"
            >
              START FOR FREE TODAY
              <ArrowRight size={22} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HomeSec3;
