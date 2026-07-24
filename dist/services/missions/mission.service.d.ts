import { DeliveryEvent, Mission, MissionProgressResult, Player } from '../../interfaces';
/**
 * Tracks progress on the three daily missions and completes them once their
 * target is reached. Progress counters (dailyMissionProgress) are read from
 * the player snapshot passed in — this service does not persist anything.
 * TODO(Backend Developer 2): daily counters must be reset at day rollover
 * before being passed into this service.
 */
export declare class MissionService {
    updateProgress(player: Player, event: DeliveryEvent): MissionProgressResult;
    /**
     * Summarizes progress on the single mission most worth surfacing in the
     * API response (see PlayerProgress.missionProgress).
     */
    getPrimaryMissionSummary(missions: Mission[]): {
        completed: number;
        target: number;
    };
    private getProgressCount;
}
