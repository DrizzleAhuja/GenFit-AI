import React from "react";
import { NavLink } from "react-router-dom";
import oldLogo from "../assets/navbarlogo-removebg-preview.png";
import newLogo from "../assets/GenFit_AI__Elevate_Your_Fitness-removebg-preview.png";

export default function GenFitLogo({ className = "", showText = false, size = "default", isHeader = false }) {
  const sizeClasses = {
    small: "h-8 sm:h-10",
    default: "h-10 sm:h-12",
    large: "h-16 sm:h-20",
    xlarge: "h-20 sm:h-28",
    xllarge: "h-32 sm:h-48"
  }

  const logoHeight = sizeClasses[size] || sizeClasses.default;
  const logoToUse = isHeader ? oldLogo : newLogo;

  return (
    <NavLink
      to="/"
      className={`flex items-center gap-3 group px-4 py-2 rounded-xl hover:bg-white/5 transition-all duration-300 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Luminous Branding Aura (Fixed visibility) */}
        <div className="absolute inset-x-0 h-10 w-full bg-[#8B5CF6]/30 blur-2xl opacity-50 transition-opacity duration-700 rounded-full scale-125" />
        <div className="absolute inset-y-0 w-10 h-full bg-[#22D3EE]/25 blur-xl opacity-40 transition-opacity duration-700 rounded-full scale-125" />
        
        <img 
          src={logoToUse} 
          alt="GenFit AI Logo" 
          className={`${logoHeight} w-auto object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(139,92,246,0.6)] brightness-[1.25] contrast-[1.25]`}
        />
      </div>
    </NavLink>
  );
}
