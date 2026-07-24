import { MissionService } from '@/services/missions/mission.service';
import { MissionId } from '@/constants/missions.constants';
import { createDefaultPlayer } from '@/models/player.model';

describe('MissionService', () => {
  const missionService = new MissionService();

  it('completes the 5-deliveries mission and awards XP on the 5th delivery today', () => {
    const player = createDefaultPlayer();
    player.dailyMissionProgress.deliveriesToday = 5;

    const result = missionService.updateProgress(player, { deliveryCompleted: true, onTime: true });

    const mission = result.missions.find((m) => m.id === MissionId.FIVE_DELIVERIES);
    expect(mission?.completed).toBe(true);
    expect(result.newlyCompleted.map((m) => m.id)).toContain(MissionId.FIVE_DELIVERIES);
    expect(result.xpAwarded).toBeGreaterThanOrEqual(100);
  });

  it('does not re-award XP for a mission already completed today', () => {
    const player = createDefaultPlayer();
    player.dailyMissionProgress.deliveriesToday = 5;
    player.dailyMissionProgress.completedMissionIds = [MissionId.FIVE_DELIVERIES];

    const result = missionService.updateProgress(player, { deliveryCompleted: true, onTime: true });

    expect(result.newlyCompleted.map((m) => m.id)).not.toContain(MissionId.FIVE_DELIVERIES);
  });

  it('summarizes primary mission progress for an in-progress mission', () => {
    const player = createDefaultPlayer();
    player.dailyMissionProgress.deliveriesToday = 3;

    const result = missionService.updateProgress(player, { deliveryCompleted: true, onTime: true });
    const summary = missionService.getPrimaryMissionSummary(result.missions);

    expect(summary).toEqual({ completed: 3, target: 5 });
  });
});
