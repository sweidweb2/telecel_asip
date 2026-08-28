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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string
          subject?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          body_html: string
          categories: string[]
          created_at: string
          id: string
          is_featured: boolean
          published_at: string | null
          reading_time_minutes: number
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          summary: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name: string
          body_html?: string
          categories?: string[]
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          reading_time_minutes?: number
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          summary: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          body_html?: string
          categories?: string[]
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          reading_time_minutes?: number
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          summary?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      startups: {
        Row: {
          created_at: string
          description: string
          founded_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          status: Database["public"]["Enums"]["startup_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          founded_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          status?: Database["public"]["Enums"]["startup_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          founded_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["startup_status"]
          updated_at?: string
        }
        Relationships: []
      }
      startup_details: {
        Row: {
          amount_raised: number | null
          business_model: string | null
          category: string | null
          founding_year: number | null
          funding_goal: number | null
          industry: string | null
          location: string | null
          problem: string | null
          size: string | null
          solution: string | null
          startup_id: string
          target_market: string | null
          team: string | null
          website_url: string | null
        }
        Insert: {
          amount_raised?: number | null
          business_model?: string | null
          category?: string | null
          founding_year?: number | null
          funding_goal?: number | null
          industry?: string | null
          location?: string | null
          problem?: string | null
          size?: string | null
          solution?: string | null
          startup_id: string
          target_market?: string | null
          team?: string | null
          website_url?: string | null
        }
        Update: {
          amount_raised?: number | null
          business_model?: string | null
          category?: string | null
          founding_year?: number | null
          funding_goal?: number | null
          industry?: string | null
          location?: string | null
          problem?: string | null
          size?: string | null
          solution?: string | null
          startup_id?: string
          target_market?: string | null
          team?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_details_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: true
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_registrations: {
        Row: {
          company_name: string
          consent: boolean
          country: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          pitch: string
          sector: string
        }
        Insert: {
          company_name: string
          consent: boolean
          country: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          pitch: string
          sector: string
        }
        Update: {
          company_name?: string
          consent?: boolean
          country?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          pitch?: string
          sector?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      get_user_stats: {
        Args: never
        Returns: {
          total: number
          admins: number
          editors: number
          viewers: number
          new_this_week: number
          new_this_month: number
        }[]
      }
      create_startup_with_details: {
        Args: {
          p_core: Json
          p_details: Json
        }
        Returns: {
          id: string
          slug: string
        }[]
      }
      update_startup_with_details: {
        Args: {
          p_id: string
          p_core: Json
          p_details: Json
        }
        Returns: {
          id: string
          slug: string
          previous_slug: string
        }[]
      }
      create_blog_with_featured: {
        Args: {
          p_blog: Json
        }
        Returns: {
          id: string
          slug: string
        }[]
      }
      update_blog_with_featured: {
        Args: {
          p_id: string
          p_blog: Json
        }
        Returns: {
          id: string
          slug: string
          previous_slug: string
        }[]
      }
      get_related_published_blogs: {
        Args: {
          p_slug: string
          p_limit?: number
        }
        Returns: {
          id: string
          slug: string
          title: string
          summary: string
          categories: string[]
          thumbnail_url: string | null
          author_name: string
          author_avatar_url: string | null
          reading_time_minutes: number
          published_at: string | null
          is_featured: boolean
        }[]
      }
    }
    Enums: {
      blog_status: "draft" | "published"
      startup_status: "draft" | "active" | "inactive"
      user_role: "admin" | "editor" | "viewer"
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
      blog_status: ["draft", "published"],
      startup_status: ["draft", "active", "inactive"],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const
