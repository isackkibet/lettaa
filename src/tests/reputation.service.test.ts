import { ReputationService } from '@/services/reputation/reputation.service';
import { createDefaultPlayer } from '@/models/player.model';

describe('ReputationService', () => {
  const reputationService = new ReputationService();

  it('returns 100 for a flawless track record', () => {
    const player = createDefaultPlayer();
    player.deliveriesCompleted = 20;
    player.onTimeDeliveries = 20;
    player.fiveStarRatings = 20;
    player.totalRatedDeliveries = 20;

    expect(reputationService.calculate(player)).toBe(100);
  });

  it('returns a mid-range score for a mixed track record', () => {
    const player = createDefaultPlayer();
    player.deliveriesCompleted = 10;
    player.onTimeDeliveries = 5;
    player.fiveStarRatings = 2;
    player.totalRatedDeliveries = 10;

    const score = reputationService.calculate(player);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('never returns a value outside 0-100', () => {
    const player = createDefaultPlayer();
    const score = reputationService.calculate(player);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
