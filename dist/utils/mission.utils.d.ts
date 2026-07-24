import { Mission } from '../interfaces';
/**
 * Picks the mission most worth surfacing to the player: the incomplete
 * mission closest to completion, or (if all are complete) the last one.
 * Shared by MissionService's summary and FeedbackService's nudge so both
 * agree on which mission is "the" mission this response is about.
 */
export declare function pickPrimaryMission(missions: Mission[]): Mission | null;
