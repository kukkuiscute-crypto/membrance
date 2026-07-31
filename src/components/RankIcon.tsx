import { memo } from "react";

interface RankIconProps {
  rank: string;
  color: string; // raw hsl triplet, e.g. "45 93% 52%"
  size?: number;
  className?: string;
}

/**
 * Animated SVG rank emblems. Pure CSS/SMIL animation for GPU-friendly 240fps.
 */
const RankIcon = memo(({ rank, color, size = 24, className = "" }: RankIconProps) => {
  const c = `hsl(${color})`;
  const soft = `hsl(${color} / 0.35)`;
  const id = `rk-${rank.replace(/\s+/g, "")}`;

  const common = { width: size, height: size, viewBox: "0 0 48 48", className, fill: "none" as const };

  const spinSlow = (
    <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="14s" repeatCount="indefinite" />
  );

  switch (rank) {
    case "Bronze":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="15" stroke={c} strokeWidth="3" fill={soft} />
          <path d="M17 24l5 5 9-10" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    case "Silver":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.2" />
              <stop offset="50%" stopColor={c} stopOpacity="1">
                <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor={c} stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M24 6l16 7v11c0 9-7 15-16 18C15 39 8 33 8 24V13z" stroke={`url(#${id})`} strokeWidth="3" fill={soft} />
        </svg>
      );
    case "Gold":
      return (
        <svg {...common}>
          <path d="M24 6l5.5 11.5L42 19l-9 8.8L35.2 40 24 34l-11.2 6L15 27.8 6 19l12.5-1.5z" fill={soft} stroke={c} strokeWidth="2.5" strokeLinejoin="round">
            <animateTransform attributeName="transform" type="scale" values="1;1.08;1" additive="sum" dur="2.6s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    case "Platinum":
      return (
        <svg {...common}>
          <g>
            <polygon points="24,6 40,15 40,33 24,42 8,33 8,15" fill={soft} stroke={c} strokeWidth="2.5" />
            {spinSlow}
          </g>
          <circle cx="24" cy="24" r="5" fill={c}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    case "Diamond":
      return (
        <svg {...common}>
          <path d="M14 8h20l8 11-18 21L6 19z" fill={soft} stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M6 19h36M14 8l4 11 6 21 6-21 4-11" stroke={c} strokeWidth="1.5" opacity="0.8" />
          <path d="M16 14l4 4" stroke="hsl(0 0% 100%)" strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    case "Ruby":
      return (
        <svg {...common}>
          <path d="M16 8h16l8 10-16 22L8 18z" fill={soft} stroke={c} strokeWidth="2.5" strokeLinejoin="round">
            <animate attributeName="fill-opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M8 18h32" stroke={c} strokeWidth="1.5" />
        </svg>
      );
    case "Amethyst":
      return (
        <svg {...common}>
          <g>
            <path d="M24 5l13 9-5 25H16L11 14z" fill={soft} stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M11 14h26M24 5v34" stroke={c} strokeWidth="1.4" opacity="0.7" />
            <animateTransform attributeName="transform" type="rotate" values="-4 24 24;4 24 24;-4 24 24" dur="4s" repeatCount="indefinite" />
          </g>
        </svg>
      );
    case "Pearl":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={id} cx="35%" cy="30%">
              <stop offset="0%" stopColor="hsl(0 0% 100%)" />
              <stop offset="100%" stopColor={c} stopOpacity="0.55" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="15" fill={`url(#${id})`} stroke={c} strokeWidth="2" />
          <ellipse cx="18" cy="18" rx="4" ry="2.6" fill="hsl(0 0% 100%)" opacity="0.9">
            <animate attributeName="opacity" values="0.35;0.95;0.35" dur="3s" repeatCount="indefinite" />
          </ellipse>
        </svg>
      );
    case "Obsidian":
      return (
        <svg {...common}>
          <path d="M24 4l14 12-6 28H16L10 16z" fill={`hsl(${color} / 0.85)`} stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M24 4l-4 40M24 4l8 40" stroke="hsl(0 0% 100% / 0.5)" strokeWidth="1.5">
            <animate attributeName="stroke-opacity" values="0.15;0.7;0.15" dur="2.8s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    case "Super League":
      return (
        <svg {...common}>
          <g>
            <circle cx="24" cy="24" r="19" stroke={c} strokeWidth="1.5" strokeDasharray="6 6" opacity="0.7">
              {spinSlow}
            </circle>
          </g>
          <path d="M24 7l5 12 13 1-10 8.5L35 42l-11-6.5L13 42l3-13.5L6 20l13-1z" fill={`hsl(${color} / 0.3)`} stroke={c} strokeWidth="2.5" strokeLinejoin="round">
            <animate attributeName="stroke-width" values="2;3.2;2" dur="1.8s" repeatCount="indefinite" />
          </path>
          <circle cx="24" cy="26" r="3.5" fill={c}>
            <animate attributeName="r" values="2.5;4;2.5" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="14" stroke={c} strokeWidth="3" fill={soft} />
        </svg>
      );
  }
});

RankIcon.displayName = "RankIcon";
export default RankIcon;
