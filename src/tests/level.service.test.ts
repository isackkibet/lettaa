import { LevelService } from '@/services/levels/level.service';

describe('LevelService', () => {
  const levelService = new LevelService();

  it('stays at Rookie Rider below 200 XP', () => {
    const result = levelService.checkLevel(1, 150);
    expect(result.level).toBe(1);
    expect(result.levelTitle).toBe('Rookie Rider');
    expect(result.levelUp).toBe(false);
  });

  it('detects a level-up crossing the Street Navigator threshold', () => {
    const result = levelService.checkLevel(2, 520);
    expect(result.level).toBe(3);
    expect(result.levelTitle).toBe('Street Navigator');
    expect(result.levelUp).toBe(true);
  });

  it('does not flag a level-up when staying within the same level', () => {
    const result = levelService.checkLevel(3, 600);
    expect(result.level).toBe(3);
    expect(result.levelUp).toBe(false);
  });

  it('caps at Avalanche Legend for XP beyond the top threshold', () => {
    const result = levelService.checkLevel(9, 999999);
    expect(result.level).toBe(10);
    expect(result.levelTitle).toBe('Avalanche Legend');
  });
});
