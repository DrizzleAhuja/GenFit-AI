import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, TrendingUp, ShieldAlert, HeartPulse } from 'lucide-react';

const HomeSec2 = () => {
  const stats = [
    {
      label: "India's Diabetes Burden",
      value: "101 M+",
      subValue: "Indians living with Diabetes as of 2026 — the world's highest absolute number.",
      source: "Source: ICMR-INDIAB Study, 2023 (updated est.)",
      icon: <ShieldAlert className="text-[#FACC15]" size={24} />
    },
    {
      label: "AI Wellness Market",
      value: "Booming",
      subValue: "India's digital health & AI fitness market is projected to be one of the fastest-growing by 2027.",
      source: "Source: FICCI / Ernst & Young, 2025",
      icon: <TrendingUp className="text-[#22D3EE]" size={24} />
    },
    {
      label: "AI Form Correction",
      value: "Proven",
      subValue: "Real-time AI posture feedback measurably reduces injury risk and improves rep quality.",
      source: "Source: GenFit AI / Google MoveNet Benchmarks, 2026",
      icon: <Activity className="text-[#22D3EE]" size={24} />
    },
    {
      label: "Fit India Movement",
      value: "Since '19",
      subValue: "Launched by PM Modi on National Sports Day 2019 — GenFit AI is aligned with this mission.",
      source: "Source: Ministry of Youth Affairs & Sports, India",
      icon: <Users className="text-emerald-400" size={24} />
    },
    {
      label: "AI Health Tech in India",
      value: "Rising",
      subValue: "India's AI health tech sector saw record investment in 2025, with GenFit at the forefront.",
      source: "Source: Coherent Market Insights, 2025",
      icon: <HeartPulse className="text-rose-400" size={24} />
    }
  ];

  return (
    <section className="bg-[#020617] py-20 relative overflow-hidden">
      {/* Subtle Background Text */}
      <div className="absolute top-10 left-10 text-[120px] font-black text-white/[0.03] pointer-events-none select-none uppercase leading-none">
        HEALTH
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="mb-16 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-widest">Why It Matters · April 2026</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            The Health Opportunity
          </h2>
          <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
            India stands at a pivotal health crossroads. The data from government bodies, WHO, and independent research shows an urgent need for accessible, AI-driven preventative care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-[#22D3EE]/40 transition-all group relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#22D3EE]/0 to-[#22D3EE]/0 group-hover:from-[#22D3EE]/5 group-hover:to-transparent transition-all duration-500 rounded-3xl" />
              <div className="mb-4 p-3 rounded-2xl bg-white/5 inline-block group-hover:bg-white/10 transition-colors">
                {item.icon}
              </div>
              <div className="text-3xl font-black text-white mb-2 group-hover:text-[#22D3EE] transition-colors">
                {item.value}
              </div>
              <div className="text-base font-bold text-gray-200 mb-2 uppercase tracking-tight">
                {item.label}
              </div>
              <div className="text-sm text-gray-400 mb-4 leading-relaxed">
                {item.subValue}
              </div>
              <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest pt-4 border-t border-white/5">
                {item.source}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission Callout */}
        <div className="mt-20 p-10 rounded-[40px] bg-gradient-to-br from-[#22D3EE]/8 to-[#3B82F6]/5 border border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                India's health mandate &<br /> global alignment
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                GenFit AI is designed to support India's national health movement and the goals outlined under the National Digital Health Mission (NDHM, 2020). Our platform makes verifiable, structured fitness accessible to everyone.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every workout session on GenFit AI contributes to a measurable, personalised health record — aligned with how India tracks wellness in 2026.
              </p>
            </div>
            <div className="flex flex-col gap-4">
               {[
                 { title: "Fit India Movement", sub: "Govt. health initiative, launched Aug 29, 2019" },
                 { title: "NDHM Compliant", sub: "National Digital Health Mission alignment" },
                 { title: "ICMR Guidelines", sub: "Weekly activity & nutrition recommendations" },
                 { title: "WHO Health GAP 2026", sub: "Global Action Plan on Physical Activity" }
               ].map((m, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#22D3EE]/20 transition-all">
                    <div className="w-2 h-2 rounded-full bg-[#22D3EE] flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white uppercase">{m.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{m.sub}</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSec2;
