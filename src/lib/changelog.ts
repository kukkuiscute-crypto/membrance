export interface ChangeEntry {
  version: string;
  name: string;
  date: string;
  current?: boolean;
  changes: string[];
}

export const APP_VERSION = "Alpha 2.0";

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "Alpha 2.0",
    name: "The Chalkboard Update",
    date: "2026-08-02",
    current: true,
    changes: [
      "New AI Writing Board — a full chalkboard where the Helper Bot grabs a chalk and solves equations step by step.",
      "Helper Bot glow-up: waving, cheering, blinking, brighter thrusters, chalk mode and a talking option in Settings.",
      "Rank emblems rebuilt with orbiting halos, sparkles and deeper faux-3D shading.",
      "Workstation rebuilt into a command center with streaks, difficulty modes, timed missions and quick launchers.",
      "New Update Directory page tracking every version of MEMBRANCE.",
      "16 brand-new themes and a smoother theme picker.",
      "Download section moved to Coming Soon while native builds are rebuilt.",
      "Performance pass across the dashboard for steadier high-FPS animation.",
    ],
  },
  {
    version: "Alpha 1.9",
    name: "Ranks & Moderation",
    date: "2026-07-20",
    changes: [
      "Ten-tier rank ladder: Bronze → Super League with animated emblems.",
      "Level-up and rank-up celebration popups on the Rankings page.",
      "Chat filter with warnings, suggestions and temporary chat bans.",
      "Community creation limited to Super League, admins and devs.",
    ],
  },
  {
    version: "Alpha 1.8",
    name: "Glow Up",
    date: "2026-07-05",
    changes: [
      "Aurora backdrop, glass surfaces and hover-lift motion across the app.",
      "Alpha badge added to every page.",
      "Flashcards intro animation and sleeker card design.",
      "Live Classes marked as Work In Progress with a build tracker.",
    ],
  },
  {
    version: "Alpha 1.7",
    name: "Accounts & Passkeys",
    date: "2026-06-18",
    changes: [
      "Account Hub for linking multiple profiles to one Google account.",
      "Passkey support and hardened auth endpoints.",
      "Leaked-password protection enabled.",
    ],
  },
  {
    version: "Alpha 1.6",
    name: "Planner & Tracker",
    date: "2026-05-30",
    changes: [
      "Calendar Planner with monthly, weekly, one-time and daily routines.",
      "Study Tracker with routine check-ins.",
      "AI Study Helper for chapter revision.",
    ],
  },
  {
    version: "Alpha 1.5",
    name: "Communities",
    date: "2026-05-10",
    changes: [
      "Public and request-to-join communities with chat and settings.",
      "All-time and monthly leaderboards with automatic monthly resets.",
      "Study Connections for one-to-one chats.",
    ],
  },
  {
    version: "Alpha 1.2",
    name: "Video Hub",
    date: "2026-04-14",
    changes: [
      "Curated study video library with infinite scroll.",
      "Watch history, search history and saved videos in Your Desk.",
    ],
  },
  {
    version: "Alpha 1.1",
    name: "Helper Bot",
    date: "2026-03-28",
    changes: [
      "First flying Helper Bot with contextual tips.",
      "Username-only sign in, no email required.",
      "Themes engine and light mode.",
    ],
  },
  {
    version: "Alpha 1.0",
    name: "First Light",
    date: "2026-03-02",
    changes: [
      "MEMBRANCE launches with the Workstation, Flashcards and points.",
      "Cinematic intro sequence and dashboard shell.",
    ],
  },
];
