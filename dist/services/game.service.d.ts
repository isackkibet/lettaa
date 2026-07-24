import { DeliveryEvent, Player, PlayerProgress } from '../interfaces';
import { XPService } from './xp/xp.service';
import { MissionService } from './missions/mission.service';
import { LevelService } from './levels/level.service';
import { AchievementService } from './achievements/achievement.service';
import { ReputationService } from './reputation/reputation.service';
import { RewardService } from './rewards/reward.service';
import { FeedbackService } from './feedback/feedback.service';
/**
 * Orchestrates the core game loop:
 * Delivery -> XP -> Mission Progress -> Achievement Check -> Level Check
 * -> Reputation Update -> Reward Eligibility -> Feedback Generation.
 *
 * Pure function of (player, event) -> PlayerProgress. Never touches a
 * database; the caller (GameController) is responsible for loading the
 * player snapshot beforehand and persisting the updated one afterward.
 */
export declare class GameService {
    private readonly xpService;
    private readonly missionService;
    private readonly levelService;
    private readonly achievementService;
    private readonly reputationService;
    private readonly rewardService;
    private readonly feedbackService;
    constructor(xpService?: XPService, missionService?: MissionService, levelService?: LevelService, achievementService?: AchievementService, reputationService?: ReputationService, rewardService?: RewardService, feedbackService?: FeedbackService);
    processDelivery(player: Player, event: DeliveryEvent): PlayerProgress;
    private applyDeliveryToPlayer;
}
