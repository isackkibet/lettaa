import { AchievementService } from '@/services/achievements/achievement.service';
import { AchievementId } from '@/constants/achievements.constants';
import { createDefaultPlayer } from '@/models/player.model';

describe('AchievementService', () => {
  const achievementService = new AchievementService();

  it('unlocks First Delivery after one completed delivery', () => {
    const player = createDefaultPlayer();
    player.totalDeliveries = 1;

    const { newlyUnlocked } = achievementService.evaluate(player, 1);

    expect(newlyUnlocked.map((a) => a.id)).toContain(AchievementId.FIRST_DELIVERY);
  });

  it('does not re-unlock an achievement the player already has', () => {
    const player = createDefaultPlayer();
    player.totalDeliveries = 1;
    player.unlockedAchievementIds = [AchievementId.FIRST_DELIVERY];

    const { newlyUnlocked, all } = achievementService.evaluate(player, 1);

    expect(newlyUnlocked.map((a) => a.id)).not.toContain(AchievementId.FIRST_DELIVERY);
    expect(all.find((a) => a.id === AchievementId.FIRST_DELIVERY)?.earned).toBe(true);
  });

  it('unlocks Customer Favorite after 25 five-star ratings', () => {
    const player = createDefaultPlayer();
    player.fiveStarRatings = 25;

    const { newlyUnlocked } = achievementService.evaluate(player, 1);

    expect(newlyUnlocked.map((a) => a.id)).toContain(AchievementId.CUSTOMER_FAVORITE);
  });
});
