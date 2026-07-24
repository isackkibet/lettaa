import { Mission } from '@/interfaces';

/**
 * Picks the mission most worth surfacing to the player: the incomplete
 * mission closest to completion, or (if all are complete) the last one.
 * Shared by MissionService's summary and FeedbackService's nudge so both
 * agree on which mission is "the" mission this response is about.
 */
export function pickPrimaryMission(missions: Mission[]): Mission | null {
  if (missions.length === 0) return null;

  const incomplete = missions.filter((m) => !m.completed);
  if (incomplete.length === 0) {
    return missions[missions.length - 1];
  }

  return [...incomplete].sort(
    (a, b) => b.progress / b.target - a.progress / a.target,
  )[0];
}
