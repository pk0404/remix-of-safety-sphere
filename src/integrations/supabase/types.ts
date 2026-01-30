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
      check_ins: {
        Row: {
          checked_in_at: string
          created_at: string
          id: string
          location_lat: number | null
          location_lng: number | null
          next_check_in_due: string | null
          notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          next_check_in_due?: string | null
          notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          next_check_in_due?: string | null
          notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      evidence: {
        Row: {
          captured_at: string
          duration_seconds: number | null
          file_size: number | null
          file_url: string
          id: string
          incident_id: string | null
          latitude: number | null
          longitude: number | null
          media_type: string
          user_id: string
        }
        Insert: {
          captured_at?: string
          duration_seconds?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          incident_id?: string | null
          latitude?: number | null
          longitude?: number | null
          media_type: string
          user_id: string
        }
        Update: {
          captured_at?: string
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          incident_id?: string | null
          latitude?: number | null
          longitude?: number | null
          media_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      help_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          distance_km: number | null
          feedback: string | null
          id: string
          otp_code: string
          otp_verified: boolean | null
          points_earned: number | null
          rating: number | null
          requester_id: string
          requester_lat: number | null
          requester_lng: number | null
          response_time_seconds: number | null
          started_at: string | null
          status: string
          support_request_id: string
          volunteer_id: string
          volunteer_lat: number | null
          volunteer_lng: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          distance_km?: number | null
          feedback?: string | null
          id?: string
          otp_code: string
          otp_verified?: boolean | null
          points_earned?: number | null
          rating?: number | null
          requester_id: string
          requester_lat?: number | null
          requester_lng?: number | null
          response_time_seconds?: number | null
          started_at?: string | null
          status?: string
          support_request_id: string
          volunteer_id: string
          volunteer_lat?: number | null
          volunteer_lng?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          distance_km?: number | null
          feedback?: string | null
          id?: string
          otp_code?: string
          otp_verified?: boolean | null
          points_earned?: number | null
          rating?: number | null
          requester_id?: string
          requester_lat?: number | null
          requester_lng?: number | null
          response_time_seconds?: number | null
          started_at?: string | null
          status?: string
          support_request_id?: string
          volunteer_id?: string
          volunteer_lat?: number | null
          volunteer_lng?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "help_sessions_support_request_id_fkey"
            columns: ["support_request_id"]
            isOneToOne: false
            referencedRelation: "support_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_sessions_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          incident_type: string
          is_verified: boolean | null
          latitude: number
          longitude: number
          reported_at: string
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          incident_type: string
          is_verified?: boolean | null
          latitude: number
          longitude: number
          reported_at?: string
          severity?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          incident_type?: string
          is_verified?: boolean | null
          latitude?: number
          longitude?: number
          reported_at?: string
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          address: string | null
          altitude: number | null
          created_at: string
          id: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          latitude: number | null
          longitude: number | null
          message: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["incident_status"]
          user_id: string
        }
        Insert: {
          address?: string | null
          altitude?: number | null
          created_at?: string
          id?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          latitude?: number | null
          longitude?: number | null
          message?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          user_id: string
        }
        Update: {
          address?: string | null
          altitude?: number | null
          created_at?: string
          id?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          latitude?: number | null
          longitude?: number | null
          message?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          user_id?: string
        }
        Relationships: []
      }
      journey_locations: {
        Row: {
          accuracy: number | null
          id: string
          journey_id: string
          latitude: number
          longitude: number
          recorded_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          id?: string
          journey_id: string
          latitude: number
          longitude: number
          recorded_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          id?: string
          journey_id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_locations_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          completed_at: string | null
          created_at: string
          destination_lat: number | null
          destination_lng: number | null
          destination_name: string | null
          expected_arrival: string | null
          id: string
          start_latitude: number | null
          start_longitude: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          destination_lat?: number | null
          destination_lng?: number | null
          destination_name?: string | null
          expected_arrival?: string | null
          id?: string
          start_latitude?: number | null
          start_longitude?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          destination_lat?: number | null
          destination_lng?: number | null
          destination_name?: string | null
          expected_arrival?: string | null
          id?: string
          start_latitude?: number | null
          start_longitude?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      offline_sync_queue: {
        Row: {
          action_type: string
          created_at: string
          id: string
          payload: Json
          synced: boolean | null
          synced_at: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          payload: Json
          synced?: boolean | null
          synced_at?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          payload?: Json
          synced?: boolean | null
          synced_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          blood_group: string | null
          created_at: string
          emergency_message: string | null
          full_name: string | null
          id: string
          medical_conditions: string[] | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_group?: string | null
          created_at?: string
          emergency_message?: string | null
          full_name?: string | null
          id: string
          medical_conditions?: string[] | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_group?: string | null
          created_at?: string
          emergency_message?: string | null
          full_name?: string | null
          id?: string
          medical_conditions?: string[] | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      safe_locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          latitude: number
          location_type: string
          longitude: number
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          latitude: number
          location_type: string
          longitude: number
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          latitude?: number
          location_type?: string
          longitude?: number
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      safety_analytics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number | null
          recorded_at: string
          user_id: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number | null
          recorded_at?: string
          user_id: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number | null
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          request_type: string
          requester_id: string
          requester_name: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          urgency: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          request_type?: string
          requester_id: string
          requester_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          urgency?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          request_type?: string
          requester_id?: string
          requester_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          urgency?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_record_on_sos: boolean | null
          check_in_enabled: boolean | null
          check_in_interval: number | null
          countdown_duration: number | null
          countdown_sound: boolean | null
          created_at: string
          id: string
          missed_check_in_alert: boolean | null
          shake_to_sos: boolean | null
          silent_mode: boolean | null
          trigger_words: string[] | null
          updated_at: string
          user_id: string
          voice_activation: boolean | null
        }
        Insert: {
          auto_record_on_sos?: boolean | null
          check_in_enabled?: boolean | null
          check_in_interval?: number | null
          countdown_duration?: number | null
          countdown_sound?: boolean | null
          created_at?: string
          id?: string
          missed_check_in_alert?: boolean | null
          shake_to_sos?: boolean | null
          silent_mode?: boolean | null
          trigger_words?: string[] | null
          updated_at?: string
          user_id: string
          voice_activation?: boolean | null
        }
        Update: {
          auto_record_on_sos?: boolean | null
          check_in_enabled?: boolean | null
          check_in_interval?: number | null
          countdown_duration?: number | null
          countdown_sound?: boolean | null
          created_at?: string
          id?: string
          missed_check_in_alert?: boolean | null
          shake_to_sos?: boolean | null
          silent_mode?: boolean | null
          trigger_words?: string[] | null
          updated_at?: string
          user_id?: string
          voice_activation?: boolean | null
        }
        Relationships: []
      }
      volunteer_alerts: {
        Row: {
          distance_km: number | null
          id: string
          responded_at: string | null
          response: string | null
          sent_at: string
          status: string
          support_request_id: string
          viewed_at: string | null
          volunteer_id: string
        }
        Insert: {
          distance_km?: number | null
          id?: string
          responded_at?: string | null
          response?: string | null
          sent_at?: string
          status?: string
          support_request_id: string
          viewed_at?: string | null
          volunteer_id: string
        }
        Update: {
          distance_km?: number | null
          id?: string
          responded_at?: string | null
          response?: string | null
          sent_at?: string
          status?: string
          support_request_id?: string
          viewed_at?: string | null
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_alerts_support_request_id_fkey"
            columns: ["support_request_id"]
            isOneToOne: false
            referencedRelation: "support_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_alerts_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_analytics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number | null
          recorded_at?: string
        }
        Relationships: []
      }
      volunteer_locations: {
        Row: {
          accuracy: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          volunteer_id: string
        }
        Insert: {
          accuracy?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          volunteer_id: string
        }
        Update: {
          accuracy?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_locations_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_rewards: {
        Row: {
          created_at: string | null
          help_session_id: string | null
          id: string
          points: number
          reason: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string | null
          help_session_id?: string | null
          id?: string
          points: number
          reason: string
          volunteer_id: string
        }
        Update: {
          created_at?: string | null
          help_session_id?: string | null
          id?: string
          points?: number
          reason?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_rewards_help_session_id_fkey"
            columns: ["help_session_id"]
            isOneToOne: false
            referencedRelation: "help_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_rewards_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          average_response_time_seconds: number | null
          badges: string[] | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_available: boolean | null
          last_location_update: string | null
          level: string | null
          location_lat: number | null
          location_lng: number | null
          notification_radius_km: number | null
          phone: string
          rating: number | null
          reward_points: number | null
          total_responses: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          average_response_time_seconds?: number | null
          badges?: string[] | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          level?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notification_radius_km?: number | null
          phone: string
          rating?: number | null
          reward_points?: number | null
          total_responses?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          average_response_time_seconds?: number | null
          badges?: string[] | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          level?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notification_radius_km?: number | null
          phone?: string
          rating?: number | null
          reward_points?: number | null
          total_responses?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      volunteer_stats: {
        Row: {
          available_volunteers: number | null
          average_rating: number | null
          total_points_awarded: number | null
          total_responses: number | null
          total_volunteers: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      incident_status: "active" | "resolved" | "cancelled" | "pending"
      incident_type:
        | "sos"
        | "medical"
        | "fire"
        | "assault"
        | "accident"
        | "natural_disaster"
        | "other"
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
      incident_status: ["active", "resolved", "cancelled", "pending"],
      incident_type: [
        "sos",
        "medical",
        "fire",
        "assault",
        "accident",
        "natural_disaster",
        "other",
      ],
    },
  },
} as const
