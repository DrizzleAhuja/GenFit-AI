import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Target, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import GenFitLogo from '../../Components/GenFitLogo';

const HomeSec1 = ({ onLoginSuccess, onLoginError }) => {
  return (
    <section className="relative overflow-hidden bg-[#05010d] pt-20 pb-16 md:pt-32 md:pb-24">
      {/* Background blobs for premium feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-[#22D3EE] rounded-full blur-[140px] opacity-10"
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-0 w-[500px] h-[500px] bg-[#22D3EE] rounded-full blur-[140px] opacity-15"
          animate={{ scale: [1, 1.05, 1], x: [0, -20, 0], y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & CTA */}
          <motion.div 
            className="lg:col-span-7 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Feature Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#020617]/80 border border-[#1F2937] backdrop-blur-xl mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              <span className="text-sm font-semibold text-gray-200">India's #1 AI Fitness Platform · 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-white">
              Train Smarter. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                Live Better.
              </span>
            </h1>

            <p className="text-lg md:text-xl mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-gray-300">
              GenFit AI is a full-stack health platform powered by real-time computer vision, agentic AI coaching, and verified sports science — built for India and the world.
            </p>
            <p className="text-base mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed text-gray-500">
              From posture correction to personalised diet plans, our platform covers your entire fitness journey in one place — completely free to start.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10 items-center">
              <div className="relative group">
                <GoogleOAuthProvider clientId="702465560392-1mu8j4kqafadep516m62oa5vf5klt7pu.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={onLoginSuccess}
                    onError={onLoginError}
                    theme="filled_blue"
                    shape="pill"
                    size="large"
                    text="signup_with"
                    width="240px"
                  />
                </GoogleOAuthProvider>
              </div>
              <Link
                to="/AboutUs"
                className="px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:opacity-95 transition-all duration-300 shadow-lg hover:shadow-[#22D3EE]/40 flex items-center justify-center min-w-[160px]"
              >
                Learn More
              </Link>
            </div>

            {/* Alignment Badges */}
            <div className="pt-8 border-t border-[#1F2937]">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">Aligned with</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {[
                  { icon: Target, label: "Fit India Movement" },
                  { icon: Shield, label: "ICMR Guidelines" },
                  { icon: Globe, label: "WHO Health GAP 2026" },
                  { icon: Zap, label: "MoveNet by Google" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#020617] border border-[#1F2937] hover:border-[#22D3EE]/60 transition-all">
                    <item.icon className="w-3.5 h-3.5 text-[#22D3EE]" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Element */}
          <motion.div 
            className="lg:col-span-5 hidden lg:block"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="relative flex items-center justify-center" style={{minHeight: '380px'}}>
              {/* Glowing aura behind logo */}
              <div className="absolute w-72 h-72 bg-[#22D3EE] rounded-full blur-[120px] opacity-10 animate-pulse" />
              <div className="absolute w-48 h-48 bg-[#3B82F6] rounded-full blur-[80px] opacity-10 animate-pulse" style={{animationDelay:'1s'}} />
              {/* Spinning dashed ring */}
              <div className="absolute w-64 h-64 rounded-full border-2 border-dashed border-[#22D3EE]/20 animate-spin" style={{animationDuration:'18s'}} />
              <div className="absolute w-80 h-80 rounded-full border border-[#3B82F6]/10 animate-spin" style={{animationDuration:'28s', animationDirection:'reverse'}} />
              {/* The Logo */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <GenFitLogo size="large" />
                <div className="text-center">
                  <div className="text-xs font-bold text-[#22D3EE] uppercase tracking-[0.3em] mt-2">GenFit AI</div>
                  <div className="text-[10px] text-gray-500 tracking-widest uppercase mt-1">Autonomous Fitness Engine</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HomeSec1;
