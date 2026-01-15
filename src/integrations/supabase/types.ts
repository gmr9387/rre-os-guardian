export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_insights: {
        Row: {
          account_id: string
          alpha_fingerprint_json: Json | null
          avoid_conditions_json: Json | null
          best_candidate_types_json: Json | null
          best_sessions_json: Json | null
          best_symbols_json: Json | null
          created_at: string
          id: string
          rr_band_stats_json: Json | null
          updated_at: string
        }
        Insert: {
          account_id: string
          alpha_fingerprint_json?: Json | null
          avoid_conditions_json?: Json | null
          best_candidate_types_json?: Json | null
          best_sessions_json?: Json | null
          best_symbols_json?: Json | null
          created_at?: string
          id?: string
          rr_band_stats_json?: Json | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          alpha_fingerprint_json?: Json | null
          avoid_conditions_json?: Json | null
          best_candidate_types_json?: Json | null
          best_sessions_json?: Json | null
          best_symbols_json?: Json | null
          created_at?: string
          id?: string
          rr_band_stats_json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_insights_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_settings: {
        Row: {
          account_id: string
          cooldown_seconds: number
          created_at: string
          id: string
          lock_duration_minutes: number
          loss_streak_lock_threshold: number
          max_daily_loss_pct: number
          max_reentries_day: number
          mode: Database["public"]["Enums"]["trade_mode"]
          per_symbol_caps: Json | null
          two_step_confirm_enabled: boolean
          updated_at: string
        }
        Insert: {
          account_id: string
          cooldown_seconds?: number
          created_at?: string
          id?: string
          lock_duration_minutes?: number
          loss_streak_lock_threshold?: number
          max_daily_loss_pct?: number
          max_reentries_day?: number
          mode?: Database["public"]["Enums"]["trade_mode"]
          per_symbol_caps?: Json | null
          two_step_confirm_enabled?: boolean
          updated_at?: string
        }
        Update: {
          account_id?: string
          cooldown_seconds?: number
          created_at?: string
          id?: string
          lock_duration_minutes?: number
          loss_streak_lock_threshold?: number
          max_daily_loss_pct?: number
          max_reentries_day?: number
          mode?: Database["public"]["Enums"]["trade_mode"]
          per_symbol_caps?: Json | null
          two_step_confirm_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_settings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_demo: boolean
          label: string
          metaapi_account_id: string | null
          risk_profile: Database["public"]["Enums"]["risk_profile"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_demo?: boolean
          label: string
          metaapi_account_id?: string | null
          risk_profile?: Database["public"]["Enums"]["risk_profile"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_demo?: boolean
          label?: string
          metaapi_account_id?: string | null
          risk_profile?: Database["public"]["Enums"]["risk_profile"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          account_id: string | null
          created_at: string
          details_json: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          details_json?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string
          details_json?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_metrics: {
        Row: {
          account_id: string
          cooldown_violations: number | null
          created_at: string
          date: string
          evi_score: number | null
          id: string
          override_count: number | null
          revenge_tempo_score: number | null
          trust_score: number | null
          updated_at: string
        }
        Insert: {
          account_id: string
          cooldown_violations?: number | null
          created_at?: string
          date: string
          evi_score?: number | null
          id?: string
          override_count?: number | null
          revenge_tempo_score?: number | null
          trust_score?: number | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          cooldown_violations?: number | null
          created_at?: string
          date?: string
          evi_score?: number | null
          id?: string
          override_count?: number | null
          revenge_tempo_score?: number | null
          trust_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_metrics_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_connections: {
        Row: {
          account_id: string
          broker: string
          created_at: string
          environment: string
          id: string
          last_checked_at: string | null
          meta: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          broker?: string
          created_at?: string
          environment?: string
          id?: string
          last_checked_at?: string | null
          meta?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          broker?: string
          created_at?: string
          environment?: string
          id?: string
          last_checked_at?: string | null
          meta?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_connections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_metrics: {
        Row: {
          account_id: string
          created_at: string
          date: string
          id: string
          locked_risk_mode: boolean | null
          loss_streak: number | null
          max_drawdown: number | null
          realized_pnl: number | null
          realized_r: number | null
          reentries_used: number | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          date: string
          id?: string
          locked_risk_mode?: boolean | null
          loss_streak?: number | null
          max_drawdown?: number | null
          realized_pnl?: number | null
          realized_r?: number | null
          reentries_used?: number | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          date?: string
          id?: string
          locked_risk_mode?: boolean | null
          loss_streak?: number | null
          max_drawdown?: number | null
          realized_pnl?: number | null
          realized_r?: number | null
          reentries_used?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_metrics_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_replays: {
        Row: {
          account_id: string
          candidate_id: string
          created_at: string
          id: string
          timeline_json: Json
        }
        Insert: {
          account_id: string
          candidate_id: string
          created_at?: string
          id?: string
          timeline_json?: Json
        }
        Update: {
          account_id?: string
          candidate_id?: string
          created_at?: string
          id?: string
          timeline_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "decision_replays_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decision_replays_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "reentry_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      executions: {
        Row: {
          account_id: string
          broker: string | null
          candidate_id: string
          created_at: string
          executed_at: string | null
          external_ticket: string | null
          id: string
          idempotency_key: string
          request_json: Json | null
          response_json: Json | null
          status: Database["public"]["Enums"]["execution_status"]
        }
        Insert: {
          account_id: string
          broker?: string | null
          candidate_id: string
          created_at?: string
          executed_at?: string | null
          external_ticket?: string | null
          id?: string
          idempotency_key: string
          request_json?: Json | null
          response_json?: Json | null
          status?: Database["public"]["Enums"]["execution_status"]
        }
        Update: {
          account_id?: string
          broker?: string | null
          candidate_id?: string
          created_at?: string
          executed_at?: string | null
          external_ticket?: string | null
          id?: string
          idempotency_key?: string
          request_json?: Json | null
          response_json?: Json | null
          status?: Database["public"]["Enums"]["execution_status"]
        }
        Relationships: [
          {
            foreignKeyName: "executions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "reentry_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      kill_switch: {
        Row: {
          account_id: string
          activated_at: string | null
          activated_by: string | null
          created_at: string
          id: string
          is_active: boolean
          reason: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kill_switch_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reentry_candidates: {
        Row: {
          account_id: string
          blocked_reason: string | null
          candidate_type: Database["public"]["Enums"]["candidate_type"]
          created_at: string
          decision_rules_fired_json: Json | null
          entry_price: number
          event_id: string
          id: string
          metrics_json: Json | null
          order_type: string
          outcome_json: Json | null
          parallel_outcomes_json: Json | null
          personal_confidence_score: number | null
          risk_flags_json: Json | null
          rr_ratio: number | null
          score: number | null
          score_tags: string[] | null
          sl_price: number
          status: Database["public"]["Enums"]["candidate_status"]
          strategy_tag: string | null
          tp_price: number | null
          trust_context_json: Json | null
          updated_at: string
          user_id: string
          user_notes: string | null
          user_rating: string | null
        }
        Insert: {
          account_id: string
          blocked_reason?: string | null
          candidate_type: Database["public"]["Enums"]["candidate_type"]
          created_at?: string
          decision_rules_fired_json?: Json | null
          entry_price: number
          event_id: string
          id?: string
          metrics_json?: Json | null
          order_type?: string
          outcome_json?: Json | null
          parallel_outcomes_json?: Json | null
          personal_confidence_score?: number | null
          risk_flags_json?: Json | null
          rr_ratio?: number | null
          score?: number | null
          score_tags?: string[] | null
          sl_price: number
          status?: Database["public"]["Enums"]["candidate_status"]
          strategy_tag?: string | null
          tp_price?: number | null
          trust_context_json?: Json | null
          updated_at?: string
          user_id: string
          user_notes?: string | null
          user_rating?: string | null
        }
        Update: {
          account_id?: string
          blocked_reason?: string | null
          candidate_type?: Database["public"]["Enums"]["candidate_type"]
          created_at?: string
          decision_rules_fired_json?: Json | null
          entry_price?: number
          event_id?: string
          id?: string
          metrics_json?: Json | null
          order_type?: string
          outcome_json?: Json | null
          parallel_outcomes_json?: Json | null
          personal_confidence_score?: number | null
          risk_flags_json?: Json | null
          rr_ratio?: number | null
          score?: number | null
          score_tags?: string[] | null
          sl_price?: number
          status?: Database["public"]["Enums"]["candidate_status"]
          strategy_tag?: string | null
          tp_price?: number | null
          trust_context_json?: Json | null
          updated_at?: string
          user_id?: string
          user_notes?: string | null
          user_rating?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reentry_candidates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reentry_candidates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "stopout_events"
            referencedColumns: ["id"]
          },
        ]
      }
      stopout_events: {
        Row: {
          account_id: string
          created_at: string
          entry_price: number
          external_id: string | null
          id: string
          lots: number
          mode: Database["public"]["Enums"]["event_mode"]
          occurred_at: string
          payload_json: Json | null
          session_label: string | null
          side: Database["public"]["Enums"]["trade_side"]
          source: string | null
          stop_price: number
          symbol: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          entry_price: number
          external_id?: string | null
          id?: string
          lots: number
          mode?: Database["public"]["Enums"]["event_mode"]
          occurred_at?: string
          payload_json?: Json | null
          session_label?: string | null
          side: Database["public"]["Enums"]["trade_side"]
          source?: string | null
          stop_price: number
          symbol: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          entry_price?: number
          external_id?: string | null
          id?: string
          lots?: number
          mode?: Database["public"]["Enums"]["event_mode"]
          occurred_at?: string
          payload_json?: Json | null
          session_label?: string | null
          side?: Database["public"]["Enums"]["trade_side"]
          source?: string | null
          stop_price?: number
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stopout_events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      training_runs: {
        Row: {
          account_id: string
          completed_at: string | null
          created_at: string
          id: string
          params_json: Json
          results_json: Json | null
          started_at: string
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          params_json?: Json
          results_json?: Json | null
          started_at?: string
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          params_json?: Json
          results_json?: Json | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_runs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_secrets: {
        Row: {
          account_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          secret_hash: string
        }
        Insert: {
          account_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          secret_hash: string
        }
        Update: {
          account_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          secret_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_secrets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_account_owner: { Args: { _account_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      candidate_status:
        | "pending"
        | "executed"
        | "ignored"
        | "expired"
        | "blocked"
      candidate_type: "reclaim" | "retest" | "ladder"
      event_mode: "live" | "test" | "train"
      execution_status:
        | "pending"
        | "sending"
        | "executed"
        | "rejected"
        | "failed"
      risk_profile: "conservative" | "normal" | "aggressive"
      trade_mode: "assist" | "auto" | "safe"
      trade_side: "buy" | "sell"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      candidate_status: [
        "pending",
        "executed",
        "ignored",
        "expired",
        "blocked",
      ],
      candidate_type: ["reclaim", "retest", "ladder"],
      event_mode: ["live", "test", "train"],
      execution_status: [
        "pending",
        "sending",
        "executed",
        "rejected",
        "failed",
      ],
      risk_profile: ["conservative", "normal", "aggressive"],
      trade_mode: ["assist", "auto", "safe"],
      trade_side: ["buy", "sell"],
    },
  },
} as const
