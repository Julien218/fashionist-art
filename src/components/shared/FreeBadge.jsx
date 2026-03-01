import React from 'react';

export default function FreeBadge({ className = "" }) {
  return (
    <span className={`badge-free inline-flex items-center gap-1 ${className}`}>
      ✦ Entrée gratuite
    </span>
  );
}