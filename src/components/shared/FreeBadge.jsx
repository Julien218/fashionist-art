import React from 'react';

export default function FreeBadge({ className = "" }) {
  return (
    <span className={`badge-free ${className}`}>
      🎉 Entrée gratuite
    </span>
  );
}