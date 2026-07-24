/**
 * Mirrors the enum types defined in `letaa_core` (letaa_db.sql). Kept in
 * sync with the DB schema manually — there is no codegen step yet.
 */
export type RiderRole =
  | 'NEW_RIDER'
  | 'ACTIVE_RIDER'
  | 'VERIFIED_RIDER'
  | 'SENIOR_RIDER'
  | 'MENTOR_RIDER'
  | 'TEAM_LEADER'
  | 'REGIONAL_AMBASSADOR'
  | 'COMMUNITY_CHAMPION';

export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
