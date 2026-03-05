export function daysUntilGoal(): number {
  const now = new Date();
  const targetDate = new Date('2026-03-15'); // Example: target by mid-March
  const diff = targetDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
}
