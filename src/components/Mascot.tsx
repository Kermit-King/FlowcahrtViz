/**
 * Sprout - the FlowchartViz mascot.
 *
 * A botanical scholar: a cream seed body with ink features, two leaves
 * sprouting above an ink mortarboard, tassel tipped with a leaf.
 * Pure inline SVG; fills are token-driven via CSS vars (see DESIGN.md
 * section 7). Fixed illustration palette - only the leaves brighten in
 * dark mode.
 */
export default function Mascot({
  size = 144,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 140 140"
      width={size}
      height={size}
      role="img"
      aria-label="Sprout, the FlowchartViz mascot"
      className={className}
    >
      {/* ground shadow */}
      <ellipse
        cx="70"
        cy="126"
        rx="28"
        ry="5"
        fillOpacity="0.1"
        style={{ fill: "var(--mascot-ink)" }}
      />
      {/* sprout stem and leaves rising from behind the cap */}
      <path
        d="M52 40 C50 30 46 24 41 19"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ stroke: "var(--mascot-ink)" }}
      />
      <path
        d="M41 21 C30 22 22 15 22 4 C34 3 43 10 41 21 Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        style={{ fill: "var(--mascot-leaf)", stroke: "var(--mascot-ink)" }}
      />
      <path
        d="M47 16 C48 6 56 0 66 2 C65 12 57 18 47 16 Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        style={{
          fill: "var(--mascot-leaf-light)",
          stroke: "var(--mascot-ink)",
        }}
      />
      {/* seed body */}
      <path
        d="M70 44 C51 44 41 62 41 83 C41 104 54 117 70 117 C86 117 99 104 99 83 C99 62 89 44 70 44 Z"
        strokeWidth="3"
        strokeLinejoin="round"
        style={{ fill: "var(--mascot-cream)", stroke: "var(--mascot-ink)" }}
      />
      {/* face */}
      <circle cx="58" cy="80" r="2.6" style={{ fill: "var(--mascot-ink)" }} />
      <circle cx="82" cy="80" r="2.6" style={{ fill: "var(--mascot-ink)" }} />
      <path
        d="M62 89 Q70 97 78 89"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ stroke: "var(--mascot-ink)" }}
      />
      <ellipse
        cx="49"
        cy="89"
        rx="4.5"
        ry="3"
        fillOpacity="0.85"
        style={{ fill: "var(--mascot-blush)" }}
      />
      <ellipse
        cx="91"
        cy="89"
        rx="4.5"
        ry="3"
        fillOpacity="0.85"
        style={{ fill: "var(--mascot-blush)" }}
      />
      {/* mortarboard, worn slightly askew */}
      <g transform="rotate(-5 70 46)">
        <path
          d="M70 30 L108 46 L70 62 L32 46 Z"
          strokeWidth="3"
          strokeLinejoin="round"
          style={{ fill: "var(--mascot-ink)" }}
        />
        <circle cx="70" cy="46" r="3" style={{ fill: "var(--mascot-cream)" }} />
        {/* tassel with a leaf tip */}
        <path
          d="M106 48 C110 55 111 62 109 70"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ stroke: "var(--mascot-ink)" }}
        />
        <path
          d="M109 70 C113.5 75 113.5 84 109 89 C104.5 84 104.5 75 109 70 Z"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ fill: "var(--mascot-leaf)", stroke: "var(--mascot-ink)" }}
        />
      </g>
    </svg>
  );
}
