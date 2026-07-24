import { XPService } from '@/services/xp/xp.service';

describe('XPService', () => {
  const xpService = new XPService();

  it('awards base + on-time XP for a completed on-time delivery', () => {
    const result = xpService.calculateDeliveryXp({ deliveryCompleted: true, onTime: true });
    expect(result.xpDelta).toBe(70);
  });

  it('applies the late delivery penalty instead of the on-time bonus', () => {
    const result = xpService.calculateDeliveryXp({ deliveryCompleted: true, onTime: false });
    expect(result.xpDelta).toBe(30);
  });

  it('adds the five-star bonus on top of delivery + on-time XP', () => {
    const result = xpService.calculateDeliveryXp({
      deliveryCompleted: true,
      onTime: true,
      rating: 5,
    });
    expect(result.xpDelta).toBe(100);
  });

  it('awards nothing when the delivery was not completed', () => {
    const result = xpService.calculateDeliveryXp({ deliveryCompleted: false, onTime: true });
    expect(result.xpDelta).toBe(0);
  });
});
