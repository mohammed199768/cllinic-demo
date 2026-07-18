import React from "react";

/* Soft, original SVG medical illustration — no real logo, no copyrighted art. */
export default function MedicalIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 420 360" className={className} role="img" aria-label="Medical care illustration">
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f7df0" />
          <stop offset="1" stopColor="#1c61d4" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="180" r="160" fill="#eef6ff" />
      <circle cx="210" cy="180" r="118" fill="#ffffff" />
      <g className="animate-floaty">
        <rect x="150" y="120" width="120" height="120" rx="28" fill="url(#g2)" />
        <rect x="198" y="150" width="24" height="60" rx="6" fill="#fff" />
        <rect x="180" y="168" width="60" height="24" rx="6" fill="#fff" />
      </g>
      <g>
        <rect x="92" y="96" width="78" height="54" rx="16" fill="#ffffff" stroke="#d9eaff" />
        <circle cx="112" cy="123" r="9" fill="#26a37f" />
        <rect x="128" y="114" width="34" height="7" rx="3.5" fill="#cfe2ff" />
        <rect x="128" y="128" width="24" height="7" rx="3.5" fill="#e6eef9" />
      </g>
      <g>
        <rect x="252" y="206" width="86" height="58" rx="16" fill="#ffffff" stroke="#d7f5e8" />
        <path d="M268 235h10l4-8 6 16 4-8h12" fill="none" stroke="#2f7df0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx="300" cy="110" r="16" fill="#ffd9a8" />
      <circle cx="120" cy="250" r="12" fill="#b2ead4" />
    </svg>
  );
}
