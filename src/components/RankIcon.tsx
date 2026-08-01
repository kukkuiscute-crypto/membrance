import { memo, useId } from "react";

interface RankIconProps {
  rank: string;
  color: string; // raw hsl triplet, e.g. "45 93% 52%"
  size?: number;
  className?: string;
}

/**
 * Faux-3D animated rank emblems.
 * Each rank has a unique silhouette, bevel gradient, specular sweep and motion.
 * Pure SVG + SMIL so it stays GPU friendly at high frame rates.
 */
const RankIcon = memo(({ rank, color, size = 24, className = "" }: RankIconProps) => {
  const uid = useId().replace(/[:]/g, "");
  const c = `hsl(${color})`;
  const dark = `hsl(${color} / 0.45)`;
  const soft = `hsl(${color} / 0.22)`;
  const gid = (n: string) => `${n}-${uid}`;

  const common = { width: size, height: size, viewBox: "0 0 64 64", className, fill: "none" as const };

  /** Shared 3D-ish defs: bevel body gradient, top light, specular sweep, drop shadow */
  const Defs = ({ id }: { id: string }) => (
    <defs>
      <linearGradient id={gid(`body${id}`)} x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="hsl(0 0% 100% / 0.85)" />
        <stop offset="28%" stopColor={c} />
        <stop offset="72%" stopColor={dark} />
        <stop offset="100%" stopColor="hsl(0 0% 0% / 0.55)" />
      </linearGradient>
      <radialGradient id={gid(`glow${id}`)} cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor={c} stopOpacity="0.55" />
        <stop offset="100%" stopColor={c} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={gid(`sheen${id}`)} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0">
          <animate attributeName="offset" values="-0.4;1;-0.4" dur="3.4s" repeatCount="indefinite" />
        </stop>
        <stop offset="12%" stopColor="hsl(0 0% 100%)" stopOpacity="0.75">
          <animate attributeName="offset" values="-0.28;1.12;-0.28" dur="3.4s" repeatCount="indefinite" />
        </stop>
        <stop offset="24%" stopColor="hsl(0 0% 100%)" stopOpacity="0">
          <animate attributeName="offset" values="-0.16;1.24;-0.16" dur="3.4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      <filter id={gid(`shadow${id}`)} x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" floodColor={c} floodOpacity="0.55" />
      </filter>
    </defs>
  );

  const Aura = ({ id }: { id: string }) => (
    <circle cx="32" cy="32" r="28" fill={`url(#${gid(`glow${id}`)})`}>
      <animate attributeName="r" values="24;29;24" dur="3.6s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3.6s" repeatCount="indefinite" />
    </circle>
  );

  switch (rank) {
    // ---------------------------------------------------------------- BRONZE
    case "Bronze":
      return (
        <svg {...common}>
          <Defs id="b" /><Aura id="b" />
          <g filter={`url(#${gid("shadowb")})`}>
            <circle cx="32" cy="32" r="20" fill={`url(#${gid("bodyb")})`} />
            <circle cx="32" cy="32" r="20" fill={`url(#${gid("sheenb")})`} />
            <circle cx="32" cy="32" r="14" fill="hsl(0 0% 0% / 0.22)" />
            <path d="M23 33l6 7 12-15" stroke="hsl(0 0% 100% / 0.95)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="2.4s" repeatCount="indefinite" />
            </path>
            <ellipse cx="26" cy="22" rx="8" ry="4" fill="hsl(0 0% 100% / 0.35)" transform="rotate(-30 26 22)" />
          </g>
        </svg>
      );

    // ---------------------------------------------------------------- SILVER
    case "Silver":
      return (
        <svg {...common}>
          <Defs id="s" /><Aura id="s" />
          <g filter={`url(#${gid("shadows")})`}>
            <path d="M32 8l19 8v14c0 12-8.5 20-19 24C21.5 50 13 42 13 30V16z" fill={`url(#${gid("bodys")})`} />
            <path d="M32 8l19 8v14c0 12-8.5 20-19 24C21.5 50 13 42 13 30V16z" fill={`url(#${gid("sheens")})`} />
            <path d="M32 8v46" stroke="hsl(0 0% 0% / 0.28)" strokeWidth="1.6" />
            <path d="M32 15l11 5v10c0 7-5 12-11 15V15z" fill="hsl(0 0% 0% / 0.18)" />
            <path d="M18 17l10-4" stroke="hsl(0 0% 100% / 0.5)" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </svg>
      );

    // ------------------------------------------------------------------ GOLD
    case "Gold":
      return (
        <svg {...common}>
          <Defs id="g" /><Aura id="g" />
          <g filter={`url(#${gid("shadowg")})`}>
            <g>
              <path d="M32 7l7.4 15.4L56 24.6 44 36.3 47 53 32 45 17 53l3-16.7L8 24.6l16.6-2.2z" fill={`url(#${gid("bodyg")})`} />
              <path d="M32 7l7.4 15.4L56 24.6 44 36.3 47 53 32 45 17 53l3-16.7L8 24.6l16.6-2.2z" fill={`url(#${gid("sheeng")})`} />
              <path d="M32 7v38L17 53l3-16.7L8 24.6l16.6-2.2z" fill="hsl(0 0% 0% / 0.2)" />
              <animateTransform attributeName="transform" type="scale" values="1;1.07;1" additive="sum" dur="2.8s" repeatCount="indefinite" />
            </g>
          </g>
          <circle cx="49" cy="16" r="1.8" fill="hsl(0 0% 100%)">
            <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" />
          </circle>
        </svg>
      );

    // -------------------------------------------------------------- PLATINUM
    case "Platinum":
      return (
        <svg {...common}>
          <Defs id="p" /><Aura id="p" />
          <g filter={`url(#${gid("shadowp")})`}>
            <g>
              <polygon points="32,6 53,18 53,44 32,56 11,44 11,18" fill={`url(#${gid("bodyp")})`} />
              <polygon points="32,6 53,18 53,44 32,56 11,44 11,18" fill={`url(#${gid("sheenp")})`} />
              <polygon points="32,6 32,56 11,44 11,18" fill="hsl(0 0% 0% / 0.2)" />
              <animateTransform attributeName="transform" type="rotate" values="0 32 32;360 32 32" dur="16s" repeatCount="indefinite" />
            </g>
          </g>
          <circle cx="32" cy="32" r="7" fill="hsl(0 0% 100% / 0.9)">
            <animate attributeName="r" values="5;8;5" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite" />
          </circle>
        </svg>
      );

    // --------------------------------------------------------------- DIAMOND
    case "Diamond":
      return (
        <svg {...common}>
          <Defs id="d" /><Aura id="d" />
          <g filter={`url(#${gid("shadowd")})`}>
            <path d="M19 10h26l11 15-24 29L8 25z" fill={`url(#${gid("bodyd")})`} />
            <path d="M19 10h26l11 15-24 29L8 25z" fill={`url(#${gid("sheend")})`} />
            <path d="M8 25h48M19 10l5 15 8 29 8-29 5-15" stroke="hsl(0 0% 100% / 0.55)" strokeWidth="1.4" />
            <path d="M24 25l8 29 8-29z" fill="hsl(0 0% 100% / 0.18)" />
          </g>
          <g>
            <path d="M20 17l5 5" stroke="hsl(0 0% 100%)" strokeWidth="3" strokeLinecap="round">
              <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M44 40l3 3" stroke="hsl(0 0% 100%)" strokeWidth="2.4" strokeLinecap="round">
              <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      );

    // ------------------------------------------------------------------ RUBY
    case "Ruby":
      return (
        <svg {...common}>
          <Defs id="r" /><Aura id="r" />
          <g filter={`url(#${gid("shadowr")})`}>
            <path d="M22 11h20l11 13-21 29-21-29z" fill={`url(#${gid("bodyr")})`}>
              <animate attributeName="fill-opacity" values="0.82;1;0.82" dur="2.4s" repeatCount="indefinite" />
            </path>
            <path d="M22 11h20l11 13-21 29-21-29z" fill={`url(#${gid("sheenr")})`} />
            <path d="M11 24h42M22 11l6 13 4 29 4-29 6-13" stroke="hsl(0 0% 100% / 0.45)" strokeWidth="1.3" />
            <path d="M28 24h8l-4 29z" fill="hsl(0 0% 100% / 0.22)" />
          </g>
          <circle cx="32" cy="24" r="14" fill="none" stroke={c} strokeWidth="1" opacity="0.5">
            <animate attributeName="r" values="10;20;10" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>
      );

    // -------------------------------------------------------------- AMETHYST
    case "Amethyst":
      return (
        <svg {...common}>
          <Defs id="a" /><Aura id="a" />
          <g filter={`url(#${gid("shadowa")})`}>
            <g>
              <path d="M32 6l17 12-6 34H21L15 18z" fill={`url(#${gid("bodya")})`} />
              <path d="M32 6l17 12-6 34H21L15 18z" fill={`url(#${gid("sheena")})`} />
              <path d="M15 18h34M32 6v46" stroke="hsl(0 0% 100% / 0.4)" strokeWidth="1.3" />
              <path d="M32 6L15 18l6 34h11z" fill="hsl(0 0% 0% / 0.22)" />
              <animateTransform attributeName="transform" type="rotate" values="-5 32 32;5 32 32;-5 32 32" dur="4.4s" repeatCount="indefinite" />
            </g>
          </g>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={20 + i * 12} cy={50} r="1.4" fill={c}>
              <animate attributeName="cy" values="50;34;50" dur={`${2.6 + i * 0.5}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.9;0" dur={`${2.6 + i * 0.5}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      );

    // ----------------------------------------------------------------- PEARL
    case "Pearl":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={gid("pearl")} cx="34%" cy="28%" r="72%">
              <stop offset="0%" stopColor="hsl(0 0% 100%)" />
              <stop offset="45%" stopColor={c} stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(0 0% 0% / 0.45)" />
            </radialGradient>
            <radialGradient id={gid("pearlGlow")} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity="0.5" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill={`url(#${gid("pearlGlow")})`}>
            <animate attributeName="r" values="24;29;24" dur="3.6s" repeatCount="indefinite" />
          </circle>
          <path d="M10 40c6 8 38 8 44 0" stroke={c} strokeWidth="2.4" fill="none" opacity="0.5" strokeLinecap="round" />
          <circle cx="32" cy="30" r="19" fill={`url(#${gid("pearl")})`} />
          <ellipse cx="24" cy="21" rx="7" ry="4.4" fill="hsl(0 0% 100%)" opacity="0.9" transform="rotate(-25 24 21)">
            <animate attributeName="opacity" values="0.45;1;0.45" dur="3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="40" cy="40" rx="4" ry="2.4" fill="hsl(0 0% 100%)" opacity="0.35" transform="rotate(-25 40 40)" />
        </svg>
      );

    // -------------------------------------------------------------- OBSIDIAN
    case "Obsidian":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={gid("obs")} x1="0.2" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="hsl(0 0% 100% / 0.5)" />
              <stop offset="35%" stopColor={c} />
              <stop offset="100%" stopColor="hsl(0 0% 0% / 0.85)" />
            </linearGradient>
            <linearGradient id={gid("obsSheen")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(280 90% 75%)" stopOpacity="0">
                <animate attributeName="offset" values="-0.3;1;-0.3" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="14%" stopColor="hsl(280 90% 75%)" stopOpacity="0.7">
                <animate attributeName="offset" values="-0.16;1.14;-0.16" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="28%" stopColor="hsl(190 90% 70%)" stopOpacity="0">
                <animate attributeName="offset" values="-0.02;1.28;-0.02" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <path d="M32 5l19 16-8 38H21L13 21z" fill={`url(#${gid("obs")})`} />
          <path d="M32 5l19 16-8 38H21L13 21z" fill={`url(#${gid("obsSheen")})`} />
          <path d="M32 5L13 21l8 38h11z" fill="hsl(0 0% 0% / 0.35)" />
          <path d="M32 5l-5 54M32 5l10 54" stroke="hsl(0 0% 100% / 0.45)" strokeWidth="1.4">
            <animate attributeName="stroke-opacity" values="0.15;0.7;0.15" dur="2.8s" repeatCount="indefinite" />
          </path>
        </svg>
      );

    // ----------------------------------------------------------- SUPER LEAGUE
    case "Super League":
      return (
        <svg {...common}>
          <Defs id="sl" />
          <circle cx="32" cy="32" r="30" fill={`url(#${gid("glowsl")})`}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <g>
            <circle cx="32" cy="32" r="27" stroke={c} strokeWidth="1.6" strokeDasharray="7 7" opacity="0.75" fill="none">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="12s" repeatCount="indefinite" />
            </circle>
          </g>
          <g>
            <circle cx="32" cy="32" r="22" stroke={c} strokeWidth="1" strokeDasharray="2 6" opacity="0.5" fill="none">
              <animateTransform attributeName="transform" from="360 32 32" to="0 32 32" type="rotate" dur="9s" repeatCount="indefinite" />
            </circle>
          </g>
          <g filter={`url(#${gid("shadowsl")})`}>
            <path d="M32 9l6.4 13.3L53 24l-10.6 9.6L45 49l-13-7.6L19 49l2.6-15.4L11 24l14.6-1.7z" fill={`url(#${gid("bodysl")})`}>
              <animate attributeName="opacity" values="0.9;1;0.9" dur="1.8s" repeatCount="indefinite" />
            </path>
            <path d="M32 9l6.4 13.3L53 24l-10.6 9.6L45 49l-13-7.6L19 49l2.6-15.4L11 24l14.6-1.7z" fill={`url(#${gid("sheensl")})`} />
            <path d="M32 9v32.4L19 49l2.6-15.4L11 24l14.6-1.7z" fill="hsl(0 0% 0% / 0.18)" />
          </g>
          <circle cx="32" cy="30" r="4.5" fill="hsl(0 0% 100%)">
            <animate attributeName="r" values="3;6;3" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <Defs id="x" />
          <circle cx="32" cy="32" r="18" fill={`url(#${gid("bodyx")})`} />
          <circle cx="32" cy="32" r="18" fill={`url(#${gid("sheenx")})`} />
        </svg>
      );
  }
});

RankIcon.displayName = "RankIcon";
export default RankIcon;
