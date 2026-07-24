import { MISSION_DEFINITIONS, MissionId } from '@/constants/missions.constants';
import { DeliveryEvent, Mission, MissionProgressResult, Player } from '@/interfaces';
import { pickPrimaryMission } from '@/utils/mission.utils';

/**
 * Tracks progress on the three daily missions and completes them once their
 * target is reached. Progress counters (dailyMissionProgress) are read from
 * the player snapshot passed in — this service does not persist anything.
 * TODO(Backend Developer 2): daily counters must be reset at day rollover
 * before being passed into this service.
 */
export class MissionService {
  updateProgress(player: Player, event: DeliveryEvent): MissionProgressResult {
    const progress = player.dailyMissionProgress;
    const alreadyCompleted = new Set(progress.completedMissionIds);
    const newlyCompleted: Mission[] = [];
    let xpAwarded = 0;

    const missions: Mission[] = Object.values(MISSION_DEFINITIONS).map((def) => {
      const currentProgress = this.getProgressCount(def.id, progress);
      const wasCompleted = alreadyCompleted.has(def.id);
      const nowCompleted = wasCompleted || currentProgress >= def.target;

      const mission: Mission = {
        id: def.id,
        title: def.title,
        description: def.description,
        progress: Math.min(currentProgress, def.target),
        target: def.target,
        completed: nowCompleted,
        xpReward: def.xpReward,
        coinReward: def.coinReward,
        gemReward: def.gemReward,
        tokenReward: def.tokenReward,
      };

      if (!wasCompleted && nowCompleted && event.deliveryCompleted) {
        newlyCompleted.push(mission);
        xpAwarded += def.xpReward;
      }

      return mission;
    });

    return { missions, newlyCompleted, xpAwarded };
  }

  /**
   * Summarizes progress on the single mission most worth surfacing in the
   * API response (see PlayerProgress.missionProgress).
   */
  getPrimaryMissionSummary(missions: Mission[]): { completed: number; target: number } {
    const primary = pickPrimaryMission(missions);
    if (!primary) return { completed: 0, target: 0 };
    return { completed: primary.progress, target: primary.target };
  }

  private getProgressCount(
    id: MissionId,
    progress: Player['dailyMissionProgress'],
  ): number {
    switch (id) {
      case MissionId.FIVE_DELIVERIES:
        return progress.deliveriesToday;
      case MissionId.PERFECT_ON_TIME:
        // Fails for the day the moment a late delivery occurs.
        return progress.lateDeliveriesToday === 0 ? progress.deliveriesToday : 0;
      case MissionId.TWO_FIVE_STAR_RATINGS:
        return progress.fiveStarRatingsToday;
      default:
        return 0;
    }
  }
}
