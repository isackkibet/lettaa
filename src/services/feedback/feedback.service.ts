import { FEEDBACK_TEMPLATES } from '@/constants/feedback.constants';
import { Achievement, Mission } from '@/interfaces';
import { interpolate } from '@/utils/template.utils';
import { getNextLevel } from '@/utils/level.utils';
import { pickPrimaryMission } from '@/utils/mission.utils';

export interface FeedbackContext {
  levelUp: boolean;
  levelTitle: string;
  currentLevel: number;
  totalXp: number;
  wasLate: boolean;
  newlyUnlockedAchievements: Achievement[];
  newlyCompletedMissions: Mission[];
  missions: Mission[];
}

/**
 * Generates a single specific, actionable feedback message per delivery.
 * Priority: level up > achievement > mission completed > late-delivery
 * warning > closest-to-completion mission nudge > default.
 */
export class FeedbackService {
  generate(ctx: FeedbackContext): string {
    if (ctx.levelUp) {
      return interpolate(FEEDBACK_TEMPLATES.LEVEL_UP, { levelTitle: ctx.levelTitle });
    }

    if (ctx.newlyUnlockedAchievements.length > 0) {
      return interpolate(FEEDBACK_TEMPLATES.ACHIEVEMENT_UNLOCKED, {
        achievementTitle: ctx.newlyUnlockedAchievements[0].title,
      });
    }

    if (ctx.newlyCompletedMissions.length > 0) {
      const mission = ctx.newlyCompletedMissions[0];
      return interpolate(FEEDBACK_TEMPLATES.MISSION_COMPLETE, {
        missionTitle: mission.title,
        xp: mission.xpReward,
      });
    }

    const nudge = this.buildClosestMissionNudge(ctx.missions);
    if (nudge) return nudge;

    if (ctx.wasLate) {
      return FEEDBACK_TEMPLATES.LATE_DELIVERY;
    }

    const nextLevel = getNextLevel(ctx.currentLevel);
    if (nextLevel) {
      return interpolate(FEEDBACK_TEMPLATES.NEXT_LEVEL_PROGRESS, {
        xpRemaining: nextLevel.xpThreshold - ctx.totalXp,
        nextLevelTitle: nextLevel.title,
      });
    }

    return interpolate(FEEDBACK_TEMPLATES.MAX_LEVEL, { levelTitle: ctx.levelTitle });
  }

  private buildClosestMissionNudge(missions: Mission[]): string | null {
    const primary = pickPrimaryMission(missions);
    if (!primary || primary.completed || primary.progress === 0) return null;

    const remaining = primary.target - primary.progress;

    return interpolate(FEEDBACK_TEMPLATES.MISSION_PROGRESS, {
      progressNote: 'Great consistency.',
      remaining,
      unit: remaining === 1 ? 'delivery' : 'deliveries',
      missionTitle: primary.title,
    });
  }
}
