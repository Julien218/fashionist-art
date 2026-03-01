import React from 'react';

export default function Logo({ size = "md" }) {
  const sizes = {
    sm: { script: "text-xl", bold: "text-lg" },
    md: { script: "text-3xl", bold: "text-2xl" },
    lg: { script: "text-5xl", bold: "text-4xl" },
    xl: { script: "text-7xl", bold: "text-6xl" }
  };
  
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-baseline gap-0">
      <span className={`font-script ${s.script} text-[#C2185B] leading-none`}>
        Fashionist'
      </span>
      <span className={`font-display font-black ${s.bold} text-[#2D2024] leading-none`}>
        ART
      </span>
    </div>
  );
}