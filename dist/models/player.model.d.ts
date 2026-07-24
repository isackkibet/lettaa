import { Player, DailyMissionProgress } from '../interfaces';
/**
 * Stateless default used when the caller doesn't have a persisted player yet
 * (e.g. first request, or local testing without a database).
 * TODO(Backend Developer 2): replace calls to this with a Supabase fetch by
 * player id. This factory should only remain as a fallback/test fixture.
 */
export declare function createDefaultDailyMissionProgress(): DailyMissionProgress;
/**
 * Defaults mirror the column defaults in `letaa_core.riders`/`users`
 * (letaa_db.sql) so a fresh in-memory player matches what a freshly
 * inserted DB row would look like.
 */
export declare function createDefaultPlayer(id?: string): Player;
