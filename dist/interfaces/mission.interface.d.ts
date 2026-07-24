import { MissionId } from '../constants/missions.constants';
export interface Mission {
    id: MissionId;
    title: string;
    description: string;
    progress: number;
    target: number;
    completed: boolean;
    xpReward: number;
}
export interface MissionProgressResult {
    missions: Mission[];
    newlyCompleted: Mission[];
    xpAwarded: number;
}
