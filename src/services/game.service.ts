import { DeliveryEvent, Player, PlayerProgress } from '@/interfaces';
import { XPService } from './xp/xp.service';
import { MissionService } from './missions/mission.service';
import { LevelService } from './levels/level.service';
import { AchievementService } from './achievements/achievement.service';
import { ReputationService } from './reputation/reputation.service';
import { RewardService } from './rewards/reward.service';
import { FeedbackService } from './feedback/feedback.service';
import { FEEDBACK_TEMPLATES } from '@/constants/feedback.constants';

/**
 * Orchestrates the core game loop:
 * Delivery -> XP -> Mission Progress -> Achievement Check -> Level Check
 * -> Reputation Update -> Reward Eligibility -> Feedback Generation.
 *
 * Pure function of (player, event) -> PlayerProgress. Never touches a
 * database; the caller (GameController) is responsible for loading the
 * player snapshot beforehand and persisting the updated one afterward.
 */
export class GameService {
  constructor(
    private readonly xpService: XPService = new XPService(),
    private readonly missionService: MissionService = new MissionService(),
    private readonly levelService: LevelService = new LevelService(),
    private readonly achievementService: AchievementService = new AchievementService(),
    private readonly reputationService: ReputationService = new ReputationService(),
    private readonly rewardService: RewardService = new RewardService(),
    private readonly feedbackService: FeedbackService = new FeedbackService(),
  ) {}

  processDelivery(player: Player, event: DeliveryEvent): PlayerProgress {
    if (!event.deliveryCompleted) {
      const reputation = this.reputationService.calculate(player);
      return {
        xpEarned: 0,
        totalXp: player.totalXp,
        level: player.level,
        levelTitle: this.levelService.checkLevel(player.level, player.totalXp).levelTitle,
        levelUp: false,
        achievementsUnlocked: [],
        missions: [],
        missionProgress: { completed: 0, target: 0 },
        reputation,
        rewardEligible: false,
        feedback: FEEDBACK_TEMPLATES.NOT_COMPLETED,
      };
    }

    // 1. XP calculation for this delivery.
    const { xpDelta } = this.xpService.calculateDeliveryXp(event);

    // Derive the post-delivery player snapshot. TODO(Backend Developer 2):
    // this derived snapshot is what should be persisted back to Supabase.
    const updatedPlayer = this.applyDeliveryToPlayer(player, event);

    // 2. Mission progress (may award bonus XP for newly completed missions).
    const { missions, newlyCompleted, xpAwarded } = this.missionService.updateProgress(
      updatedPlayer,
      event,
    );
    updatedPlayer.dailyMissionProgress.completedMissionIds = [
      ...updatedPlayer.dailyMissionProgress.completedMissionIds,
      ...newlyCompleted.map((m) => m.id),
    ];

    const totalXpEarned = xpDelta + xpAwarded;
    updatedPlayer.totalXp = player.totalXp + totalXpEarned;

    // 3. Achievement check (depends on updated cumulative stats).
    const { newlyUnlocked } = this.achievementService.evaluate(updatedPlayer, player.level);
    updatedPlayer.unlockedAchievementIds = [
      ...updatedPlayer.unlockedAchievementIds,
      ...newlyUnlocked.map((a) => a.id),
    ];

    // 4. Level check against the pre-delivery level.
    const levelResult = this.levelService.checkLevel(player.level, updatedPlayer.totalXp);
    updatedPlayer.level = levelResult.level;

    // 5. Reputation update from the fresh cumulative stats.
    const reputation = this.reputationService.calculate(updatedPlayer);

    // 6. Reward eligibility.
    const reward = this.rewardService.checkEligibility(
      reputation,
      levelResult.levelUp,
      newlyUnlocked.length,
    );

    // 7. Feedback generation.
    const feedback = this.feedbackService.generate({
      levelUp: levelResult.levelUp,
      levelTitle: levelResult.levelTitle,
      currentLevel: levelResult.level,
      totalXp: updatedPlayer.totalXp,
      wasLate: !event.onTime,
      newlyUnlockedAchievements: newlyUnlocked,
      newlyCompletedMissions: newlyCompleted,
      missions,
    });

    const missionProgress = this.missionService.getPrimaryMissionSummary(missions);

    return {
      xpEarned: totalXpEarned,
      totalXp: updatedPlayer.totalXp,
      level: levelResult.level,
      levelTitle: levelResult.levelTitle,
      levelUp: levelResult.levelUp,
      achievementsUnlocked: newlyUnlocked,
      missions,
      missionProgress,
      reputation,
      rewardEligible: reward.eligible,
      feedback,
    };
  }

  private applyDeliveryToPlayer(player: Player, event: DeliveryEvent): Player {
    const wasRated = typeof event.rating === 'number';
    const wasFiveStar = event.rating === 5;

    return {
      ...player,
      deliveriesCompleted: player.deliveriesCompleted + 1,
      onTimeDeliveries: player.onTimeDeliveries + (event.onTime ? 1 : 0),
      lateDeliveries: player.lateDeliveries + (event.onTime ? 0 : 1),
      fiveStarRatings: player.fiveStarRatings + (wasFiveStar ? 1 : 0),
      totalRatedDeliveries: player.totalRatedDeliveries + (wasRated ? 1 : 0),
      currentOnTimeStreak: event.onTime ? player.currentOnTimeStreak + 1 : 0,
      dailyMissionProgress: {
        ...player.dailyMissionProgress,
        deliveriesToday: player.dailyMissionProgress.deliveriesToday + 1,
        onTimeDeliveriesToday:
          player.dailyMissionProgress.onTimeDeliveriesToday + (event.onTime ? 1 : 0),
        lateDeliveriesToday:
          player.dailyMissionProgress.lateDeliveriesToday + (event.onTime ? 0 : 1),
        fiveStarRatingsToday:
          player.dailyMissionProgress.fiveStarRatingsToday + (wasFiveStar ? 1 : 0),
      },
      unlockedAchievementIds: [...player.unlockedAchievementIds],
    };
  }
}
