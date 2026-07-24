"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLevelForXp = getLevelForXp;
exports.getNextLevel = getNextLevel;
const levels_constants_1 = require("../constants/levels.constants");
function getLevelForXp(totalXp) {
    let current = levels_constants_1.LEVELS[0];
    for (const level of levels_constants_1.LEVELS) {
        if (totalXp >= level.xpThreshold) {
            current = level;
        }
    }
    return current;
}
function getNextLevel(currentLevel) {
    if (currentLevel >= levels_constants_1.MAX_LEVEL)
        return null;
    return levels_constants_1.LEVELS.find((l) => l.level === currentLevel + 1) ?? null;
}
//# sourceMappingURL=level.utils.js.map