import React from 'react';

const LOGO_URL = "https://media.base44.com/images/public/6a035427dca907aa03b71398/30db7f0e0_logoFashionistArtLogo.png";

export default function Logo({ size = "md" }) {
  const heights = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-24"
  };

  return (
    <img
      src={LOGO_URL}
      alt="Fashionist'ART — Logo officiel"
      className={`${heights[size] || heights.md} w-auto object-contain`}
      style={{ filter: 'drop-shadow(0 2px 12px rgba(212,175,55,0.3))' }}
    />
  );
}
