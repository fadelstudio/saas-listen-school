"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemService = void 0;
const system_repository_1 = require("./system.repository");
// Simple in-memory cache to avoid DB hit on every request
let settingsCache = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds
exports.systemService = {
    async getSettings(forceRefresh = false) {
        const now = Date.now();
        if (!settingsCache || forceRefresh || (now - lastFetch > CACHE_TTL)) {
            settingsCache = await system_repository_1.systemRepository.getSettings();
            lastFetch = now;
        }
        return settingsCache;
    },
    async updateSettings(data) {
        const updated = await system_repository_1.systemRepository.updateSettings(data);
        settingsCache = updated; // Update cache
        lastFetch = Date.now();
        return updated;
    }
};
//# sourceMappingURL=system.service.js.map