"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_routes_1 = __importDefault(require("./game.routes"));
const router = (0, express_1.Router)();
router.use('/game', game_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map