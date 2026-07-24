"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_LEVEL = exports.LEVELS = void 0;
exports.LEVELS = [
    { level: 1, title: 'Rookie Rider', xpThreshold: 0, rewardTokens: 0, description: 'New rider onboarding' },
    { level: 2, title: 'Courier', xpThreshold: 200, rewardTokens: 2, description: 'Completed first deliveries' },
    { level: 3, title: 'Street Navigator', xpThreshold: 500, rewardTokens: 5, description: 'Consistently completes deliveries' },
    { level: 4, title: 'Route Specialist', xpThreshold: 1000, rewardTokens: 10, description: 'Demonstrates efficient routing' },
    { level: 5, title: 'City Explorer', xpThreshold: 1800, rewardTokens: 15, description: 'Covers multiple delivery zones' },
    { level: 6, title: 'Express Rider', xpThreshold: 3000, rewardTokens: 20, description: 'Maintains high delivery speed' },
    { level: 7, title: 'Elite Courier', xpThreshold: 5000, rewardTokens: 30, description: 'Reliable with excellent ratings' },
    { level: 8, title: 'Delivery Champion', xpThreshold: 8000, rewardTokens: 50, description: 'Top-performing rider' },
    { level: 9, title: 'Logistics Master', xpThreshold: 12000, rewardTokens: 80, description: 'Exceptional consistency' },
    { level: 10, title: 'Avalanche Legend', xpThreshold: 20000, rewardTokens: 150, description: 'Highest lifetime achievement' },
];
exports.MAX_LEVEL = exports.LEVELS[exports.LEVELS.length - 1].level;
//# sourceMappingURL=levels.constants.js.map