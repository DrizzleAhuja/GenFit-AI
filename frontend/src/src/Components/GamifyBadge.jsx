import React from "react";

const GamifyBadge = ({ type }) => {
  const config = {
    top1: {
      icon: '👑', label: 'Top Performer',
      wrapperClass: 'from-yellow-500/20 via-yellow-400/10 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
      iconBoxClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.6)]',
      textClass: 'from-yellow-200 to-yellow-500'
    },
    top10: {
      icon: '🥈', label: 'Elite Squad',
      wrapperClass: 'from-gray-300/20 via-gray-400/10 border-gray-300/40 shadow-[0_0_15px_rgba(209,213,219,0.15)]',
      iconBoxClass: 'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-100 shadow-[0_0_10px_rgba(209,213,219,0.5)]',
      textClass: 'from-gray-100 to-gray-400'
    },
    top50: {
      icon: '🥉', label: 'Rising Star',
      wrapperClass: 'from-amber-700/30 via-amber-600/10 border-amber-600/40 shadow-[0_0_15px_rgba(217,119,6,0.15)]',
      iconBoxClass: 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.5)]',
      textClass: 'from-amber-200 to-amber-500'
    },
    beast: {
      icon: '🔥', label: 'Beast Mode',
      wrapperClass: 'from-orange-500/20 via-red-500/10 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
      iconBoxClass: 'bg-gradient-to-br from-orange-400 to-red-600 border-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.6)]',
      textClass: 'from-orange-200 to-red-500'
    }
  };

  const style = config[type];
  if (!style) return null;

  return (
    <>
      <style>{`
        .badge-shine {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%) skewX(-15deg);
          z-index: 5;
        }
        .gamify-badge:hover .badge-shine {
          animation: badge-shimmer 1.5s infinite;
        }
        @keyframes badge-shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
      `}</style>
      <div className={`gamify-badge relative inline-flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r ${style.wrapperClass} to-transparent border rounded-full backdrop-blur-md overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 cursor-default`}>
        <div className="badge-shine"></div>
        <div className={`flex flex-shrink-0 items-center justify-center w-5 h-5 rounded-full border ${style.iconBoxClass} z-10`}>
          <span className="text-[10px] drop-shadow-md leading-none">{style.icon}</span>
        </div>
        <span className={`text-[10px] sm:text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r ${style.textClass} tracking-widest uppercase z-10 pr-2 pb-[1px]`}>
          {style.label}
        </span>
      </div>
    </>
  );
};

export default GamifyBadge;
