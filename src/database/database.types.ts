export interface Database {
  public: {
    Tables: {
      riders: {
        Row: {
          id: string;
          wallet_address: string | null;
          total_xp: number;
          level: number;
          deliveries_completed: number;
          on_time_deliveries: number;
          late_deliveries: number;
          five_star_ratings: number;
          total_rated_deliveries: number;
          current_on_time_streak: number;
          daily_mission_progress: Json;
          unlocked_achievement_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address?: string | null;
          total_xp?: number;
          level?: number;
          deliveries_completed?: number;
          on_time_deliveries?: number;
          late_deliveries?: number;
          five_star_ratings?: number;
          total_rated_deliveries?: number;
          current_on_time_streak?: number;
          daily_mission_progress?: Json;
          unlocked_achievement_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string | null;
          total_xp?: number;
          level?: number;
          deliveries_completed?: number;
          on_time_deliveries?: number;
          late_deliveries?: number;
          five_star_ratings?: number;
          total_rated_deliveries?: number;
          current_on_time_streak?: number;
          daily_mission_progress?: Json;
          unlocked_achievement_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      reward_transactions: {
        Row: {
          id: string;
          rider_id: string;
          amount: number;
          reason: string;
          tx_hash: string | null;
          status: 'pending' | 'confirmed' | 'failed' | 'pending_retry';
          created_at: string;
        };
        Insert: {
          id?: string;
          rider_id: string;
          amount: number;
          reason: string;
          tx_hash?: string | null;
          status?: 'pending' | 'confirmed' | 'failed' | 'pending_retry';
          created_at?: string;
        };
        Update: {
          id?: string;
          rider_id?: string;
          amount?: number;
          reason?: string;
          tx_hash?: string | null;
          status?: 'pending' | 'confirmed' | 'failed' | 'pending_retry';
          created_at?: string;
        };
      };
    };
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];