"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelService = void 0;
const level_utils_1 = require("../../utils/level.utils");
/**
 * Determines the player's level from total XP and detects level-ups by
 * comparing against the level held before this delivery's XP was applied.
 */
class LevelService {
    checkLevel(previousLevel, totalXp) {
        const current = (0, level_utils_1.getLevelForXp)(totalXp);
        return {
            level: current.level,
            levelTitle: current.title,
            levelUp: current.level > previousLevel,
        };
    }
    getNextLevel(currentLevel) {
        return (0, level_utils_1.getNextLevel)(currentLevel);
    }
}
exports.LevelService = LevelService;
//# sourceMappingURL=level.service.js.map