import { GameService } from '@/services/game.service';
import { createDefaultPlayer } from '@/models/player.model';

describe('GameService (core game loop)', () => {
  const gameService = new GameService();

  it('runs a single delivery through the full loop and returns consistent totals', () => {
    const player = createDefaultPlayer();

    const progress = gameService.processDelivery(player, {
      deliveryCompleted: true,
      onTime: true,
      rating: 5,
    });

    expect(progress.xpEarned).toBe(110); // 50 + 20 + 40
    expect(progress.totalXp).toBe(110);
    expect(progress.level).toBe(1);
    expect(progress.levelUp).toBe(false);
    expect(progress.achievementsUnlocked.map((a) => a.title)).toContain('First Delivery');
    expect(progress.reputation).toBeGreaterThanOrEqual(0);
    expect(typeof progress.feedback).toBe('string');
  });

  it('detects a level-up when accumulated XP crosses a threshold', () => {
    const player = createDefaultPlayer();
    player.xp = 190;
    player.level = 1;

    const progress = gameService.processDelivery(player, {
      deliveryCompleted: true,
      onTime: true,
    });

    expect(progress.totalXp).toBe(260);
    expect(progress.level).toBe(2);
    expect(progress.levelUp).toBe(true);
    expect(progress.feedback).toContain('Courier');
  });

  it('returns zero XP and no state change when deliveryCompleted is false', () => {
    const player = createDefaultPlayer();

    const progress = gameService.processDelivery(player, {
      deliveryCompleted: false,
      onTime: true,
    });

    expect(progress.xpEarned).toBe(0);
    expect(progress.totalXp).toBe(0);
    expect(progress.levelUp).toBe(false);
  });
});
