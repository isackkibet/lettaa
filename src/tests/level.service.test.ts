import { LevelService } from '@/services/levels/level.service';

describe('LevelService', () => {
  const levelService = new LevelService();

  it('stays at Rookie below 200 XP', () => {
    const result = levelService.checkLevel(1, 150);
    expect(result.level).toBe(1);
    expect(result.levelTitle).toBe('Rookie');
    expect(result.levelUp).toBe(false);
  });

  it('detects a level-up crossing the Navigator threshold', () => {
    const result = levelService.checkLevel(2, 520);
    expect(result.level).toBe(3);
    expect(result.levelTitle).toBe('Navigator');
    expect(result.levelUp).toBe(true);
  });

  it('does not flag a level-up when staying within the same level', () => {
    const result = levelService.checkLevel(3, 600);
    expect(result.level).toBe(3);
    expect(result.levelUp).toBe(false);
  });

  it('caps at Avalanche Legend for XP beyond the top threshold', () => {
    const result = levelService.checkLevel(5, 999999);
    expect(result.level).toBe(5);
    expect(result.levelTitle).toBe('Avalanche Legend');
  });
});
