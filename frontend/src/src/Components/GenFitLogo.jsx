import React from "react";
import { NavLink } from "react-router-dom";
import genfitLogo from "../assets/genfitlogo-removebg-preview.png";

export default function GenFitLogo({ className = "", showText = false, size = "default" }) {
  const sizeClasses = {
    small: "h-11 sm:h-13",
    default: "h-14 sm:h-18",
    large: "h-28 sm:h-36"
  }

  const logoHeight = sizeClasses[size] || sizeClasses.default;

  return (
    <NavLink
      to="/"
      className={`flex items-center gap-3 group px-4 py-2 rounded-xl hover:bg-white/5 transition-all duration-300 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Persistent Branding Aura (Luminous glow) */}
        <div className="absolute inset-x-0 h-10 w-full bg-[#8B5CF6]/30 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 rounded-full scale-110" />
        <div className="absolute inset-y-0 w-10 h-full bg-[#22D3EE]/20 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 rounded-full scale-110" />
        
        <img 
          src={genfitLogo} 
          alt="GenFit AI Logo" 
          className={`${logoHeight} w-auto object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_35px_rgba(139,92,246,0.8)] filter brightness-[1.15] contrast-[1.15]`}
        />
      </div>
    </NavLink>
  );
}
