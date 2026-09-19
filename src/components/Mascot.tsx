import React from "react";

interface MascotProps {
  size?: number;
  className?: string;
}

/**
 * FlowchartViz Brand Logo
 *
 * Ultra-clean horizontal prerequisite DAG (Directed Acyclic Graph):
 * - Mathematically continuous split & merge curves (S-curve tangents).
 * - Symmetrical 4-node degree progression network.
 * - Modern squircle badge in brand emerald.
 */
export default function Mascot({
  size = 144,
  className = "",
}: MascotProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="FlowchartViz Logo"
      className={`inline-block select-none ${className}`}
    >
      <defs>
        <linearGradient id="fv-badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* Modern Squircle Badge */}
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="22"
        ry="22"
        fill="url(#fv-badge-grad)"
      />

      {/* Upper Prerequisite Path (Smooth S-curve split & merge) */}
      <path
        d="M 26 50 C 38 50, 38 28, 50 28 C 62 28, 62 50, 74 50"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Lower Prerequisite Path (Smooth S-curve split & merge) */}
      <path
        d="M 26 50 C 38 50, 38 72, 50 72 C 62 72, 62 50, 74 50"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Node 1: Foundation / Prerequisite Entry (Left) */}
      <circle cx="26" cy="50" r="6" fill="#ffffff" />
      <circle cx="26" cy="50" r="2.8" fill="#059669" />

      {/* Node 2: Core Semester Track (Top) */}
      <circle cx="50" cy="28" r="6" fill="#ffffff" />
      <circle cx="50" cy="28" r="2.8" fill="#059669" />

      {/* Node 3: Elective Semester Track (Bottom) */}
      <circle cx="50" cy="72" r="6" fill="#ffffff" />
      <circle cx="50" cy="72" r="2.8" fill="#059669" />

      {/* Node 4: Capstone / Graduation Target Milestone (Right) */}
      <circle cx="74" cy="50" r="7.5" fill="#ffffff" />
      <circle cx="74" cy="50" r="3.2" fill="#047857" />
    </svg>
  );
}

export { Mascot as FlowchartLogo, Mascot as BrandLogo };
