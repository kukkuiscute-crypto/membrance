export const RANKS = [
  { name: "Bronze", minPoints: 0, color: "25 55% 45%" },
  { name: "Silver", minPoints: 70, color: "0 0% 70%" },
  { name: "Gold", minPoints: 210, color: "45 93% 52%" },
  { name: "Platinum", minPoints: 420, color: "190 35% 72%" },
  { name: "Diamond", minPoints: 700, color: "195 90% 68%" },
  { name: "Ruby", minPoints: 1050, color: "350 85% 55%" },
  { name: "Amethyst", minPoints: 1470, color: "280 75% 62%" },
  { name: "Pearl", minPoints: 1960, color: "45 40% 92%" },
  { name: "Obsidian", minPoints: 2520, color: "260 25% 30%" },
  { name: "Super League", minPoints: 3200, color: "0 0% 98%" },
] as const;

export type RankName = (typeof RANKS)[number]["name"];

export function getRankInfo(points: number) {
  let rankIndex = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].minPoints) {
      rankIndex = i;
      break;
    }
  }

  const rank = RANKS[rankIndex];
  const isElite = rank.name === "Super League";
  const maxLevels = isElite ? 3 : 7;

  const nextRank = RANKS[rankIndex + 1];
  const pointsInRank = points - rank.minPoints;
  const pointsForRank = nextRank ? nextRank.minPoints - rank.minPoints : maxLevels * 100;
  const levelProgress = pointsInRank / (pointsForRank / maxLevels);
  const level = Math.min(Math.floor(levelProgress) + 1, maxLevels);
  const progressInLevel = (levelProgress - (level - 1)) * 100;

  return {
    rank: rank.name,
    level,
    maxLevels,
    color: rank.color,
    progress: Math.min(Math.max(progressInLevel, 0), 100),
    isFutureSelf: isElite,
    isElite,
    totalPoints: points,
  };
}

/** Human-readable progression rules shown on the Rankings page. */
export const RANK_RULES = [
  { title: "Earn points, climb ranks", detail: "Every rank needs more points than the last. Points come from missions, flashcards, videos and tracker streaks." },
  { title: "7 levels per rank", detail: "Each rank is split into 7 levels. Fill a level bar to advance one level — fill all 7 to promote to the next rank." },
  { title: "Super League is elite", detail: "The final rank has only 3 elite levels and is reserved for the top students." },
  { title: "Ranks never drop", detail: "All-time points only go up, so a rank you unlock is yours to keep. Monthly points reset every month for the monthly board." },
  { title: "Perks unlock with rank", detail: "Super League members (plus verified admins and devs) can create communities." },
];

export const rankIndex = (points: number) => {
  let idx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) if (points >= RANKS[i].minPoints) { idx = i; break; }
  return idx;
};

/** Only Super League members, verified admins and devs can create communities. */
export const canCreateCommunity = (points: number, opts: { isDev?: boolean; isVerified?: boolean } = {}) =>
  !!opts.isDev || !!opts.isVerified || getRankInfo(points).rank === "Super League";
