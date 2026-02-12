import React from "react";
import { NavLink } from "react-router-dom";

export default function GenFitLogo({ className = "", showText = true, size = "default" }) {
  const sizeClasses = {
    small: "text-lg",
    default: "text-xl sm:text-2xl",
    large: "text-2xl sm:text-3xl"
  };

  const logoSize = sizeClasses[size] || sizeClasses.default;

  return (
    <NavLink
      to="/"
      className={`flex items-center gap-2 group ${className}`}
    >
      {/* Logo Icon/Text - no blur */}
      <div className="relative">
        <div className={`font-extrabold ${logoSize} bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] tracking-tight`}>
          GenFit AI
        </div>
      </div>
      
      {/* Logo Text
      {showText && (
        // <div className="flex flex-col">
        //   <span className={`font-bold ${logoSize} text-white leading-tight`}>
        //     GenFit<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6]"> AI</span>
        //   </span>
        //   {/* <span className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-[#22D3EE]/80 leading-tight">
        //     AI
        //   </span> */}
        {/* // </div> */}
      {/* )}  */}
    </NavLink>
  );
}
