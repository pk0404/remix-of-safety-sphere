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
      journeys: {
        Row: {
          completed_at: string | null
          created_at: string
          destination_lat: number | null
          destination_lng: number | null
          destination_name: string | null
          expected_arrival: string | null
          id: string
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
          status?: string | null
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
      user_settings: {
        Row: {
          auto_record_on_sos: boolean | null
          countdown_duration: number | null
          countdown_sound: boolean | null
          created_at: string
          id: string
          shake_to_sos: boolean | null
          silent_mode: boolean | null
          trigger_words: string[] | null
          updated_at: string
          user_id: string
          voice_activation: boolean | null
        }
        Insert: {
          auto_record_on_sos?: boolean | null
          countdown_duration?: number | null
          countdown_sound?: boolean | null
          created_at?: string
          id?: string
          shake_to_sos?: boolean | null
          silent_mode?: boolean | null
          trigger_words?: string[] | null
          updated_at?: string
          user_id: string
          voice_activation?: boolean | null
        }
        Update: {
          auto_record_on_sos?: boolean | null
          countdown_duration?: number | null
          countdown_sound?: boolean | null
          created_at?: string
          id?: string
          shake_to_sos?: boolean | null
          silent_mode?: boolean | null
          trigger_words?: string[] | null
          updated_at?: string
          user_id?: string
          voice_activation?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
