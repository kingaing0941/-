/** XP awarded for creating a new review (edits give 0). */
export const REVIEW_XP = 20;

/** Cumulative XP required to reach a given level (level 1 starts at 0). */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor((50 * (level - 1) * level) / 2);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= xp) {
    level += 1;
  }
  return level;
}

export function xpProgress(xp: number, level: number) {
  const current = xpRequiredForLevel(level);
  const next = xpRequiredForLevel(level + 1);
  const span = Math.max(next - current, 1);
  const into = Math.max(xp - current, 0);
  return {
    current,
    next,
    into,
    remaining: Math.max(next - xp, 0),
    percent: Math.min(100, Math.round((into / span) * 100)),
  };
}
