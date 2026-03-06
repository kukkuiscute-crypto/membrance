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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_chats: {
        Row: {
          assistant: string
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assistant?: string
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assistant?: string
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          day_of_week: number | null
          description: string | null
          end_time: string | null
          event_date: string | null
          event_type: string
          id: string
          is_day_off: boolean | null
          repeat_mode: string | null
          start_time: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          description?: string | null
          end_time?: string | null
          event_date?: string | null
          event_type?: string
          id?: string
          is_day_off?: boolean | null
          repeat_mode?: string | null
          start_time?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          description?: string | null
          end_time?: string | null
          event_date?: string | null
          event_type?: string
          id?: string
          is_day_off?: boolean | null
          repeat_mode?: string | null
          start_time?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          join_mode: string
          member_count: number
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          join_mode?: string
          member_count?: number
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          join_mode?: string
          member_count?: number
          name?: string
        }
        Relationships: []
      }
      community_join_requests: {
        Row: {
          community_id: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_join_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          community_id: string
          content: string
          created_at: string
          id: string
          user_id: string
          username: string | null
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
          username?: string | null
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          community_id: string
          content: string
          created_at: string
          id: string
          post_type: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string
          id?: string
          post_type?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          post_type?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          completed: boolean | null
          created_at: string
          end_time: string
          id: string
          start_time: string
          task_date: string
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          end_time?: string
          id?: string
          start_time?: string
          task_date?: string
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          end_time?: string
          id?: string
          start_time?: string
          task_date?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          display_name: string | null
          education_system: string | null
          grade: string | null
          id: string
          is_verified: boolean
          level: number
          monthly_points: number
          monthly_points_reset_at: string | null
          points: number
          rank: string
          rank_level: number
          school_name: string | null
          theme: string
          updated_at: string
          user_id: string
          user_type: string | null
          username: string | null
          username_changed_at: string | null
          xp: number
        }
        Insert: {
          age?: number | null
          created_at?: string
          display_name?: string | null
          education_system?: string | null
          grade?: string | null
          id?: string
          is_verified?: boolean
          level?: number
          monthly_points?: number
          monthly_points_reset_at?: string | null
          points?: number
          rank?: string
          rank_level?: number
          school_name?: string | null
          theme?: string
          updated_at?: string
          user_id: string
          user_type?: string | null
          username?: string | null
          username_changed_at?: string | null
          xp?: number
        }
        Update: {
          age?: number | null
          created_at?: string
          display_name?: string | null
          education_system?: string | null
          grade?: string | null
          id?: string
          is_verified?: boolean
          level?: number
          monthly_points?: number
          monthly_points_reset_at?: string | null
          points?: number
          rank?: string
          rank_level?: number
          school_name?: string | null
          theme?: string
          updated_at?: string
          user_id?: string
          user_type?: string | null
          username?: string | null
          username_changed_at?: string | null
          xp?: number
        }
        Relationships: []
      }
      saved_videos: {
        Row: {
          channel: string | null
          created_at: string
          id: string
          thumbnail_url: string | null
          title: string
          user_id: string
          youtube_id: string | null
          youtube_url: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          title: string
          user_id: string
          youtube_id?: string | null
          youtube_url: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          title?: string
          user_id?: string
          youtube_id?: string | null
          youtube_url?: string
        }
        Relationships: []
      }
      shared_videos: {
        Row: {
          community_id: string | null
          created_at: string
          grade: string | null
          id: string
          subject: string | null
          title: string
          user_id: string
          youtube_url: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          subject?: string | null
          title: string
          user_id: string
          youtube_url: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          subject?: string | null
          title?: string
          user_id?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_videos_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      study_connections: {
        Row: {
          connected_user_id: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          connected_user_id: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          connected_user_id?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_monthly_points: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
