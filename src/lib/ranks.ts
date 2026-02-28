export const RANKS = [
  { name: "Bronze", minPoints: 0, color: "180 30% 45%" },
  { name: "Silver", minPoints: 70, color: "0 0% 65%" },
  { name: "Gold", minPoints: 210, color: "45 93% 47%" },
  { name: "Platinum", minPoints: 420, color: "200 20% 60%" },
  { name: "Diamond", minPoints: 700, color: "200 80% 65%" },
  { name: "Ruby", minPoints: 1050, color: "350 80% 55%" },
  { name: "Master", minPoints: 1470, color: "280 80% 60%" },
  { name: "Grand Master", minPoints: 1960, color: "262 90% 70%" },
  { name: "Future Self", minPoints: 2520, color: "0 0% 95%" },
] as const;

export function getRankInfo(points: number) {
  let rankIndex = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].minPoints) {
      rankIndex = i;
      break;
    }
  }

  const rank = RANKS[rankIndex];
  const isFutureSelf = rank.name === "Future Self";
  const maxLevels = isFutureSelf ? 3 : 7;

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
    isFutureSelf,
    totalPoints: points,
  };
}
