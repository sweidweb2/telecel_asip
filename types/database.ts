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
          enquiry_type: Database["public"]["Enums"]["contact_enquiry_type"]
          full_name: string
          id: string
          message: string
          phone: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          enquiry_type?: Database["public"]["Enums"]["contact_enquiry_type"]
          full_name: string
          id?: string
          message: string
          phone: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          enquiry_type?: Database["public"]["Enums"]["contact_enquiry_type"]
          full_name?: string
          id?: string
          message?: string
          phone?: string
          subject?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          open_applications: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          open_applications?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          open_applications?: boolean
          updated_at?: string
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
      cohorts: {
        Row: {
          created_at: string
          id: string
          media_url: string | null
          programme_dates_end: string | null
          programme_dates_start: string | null
          programme_status: Database["public"]["Enums"]["cohort_programme_status"]
          public_label: string
          publish_status: Database["public"]["Enums"]["cms_publish_status"]
          summary: string | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          media_url?: string | null
          programme_dates_end?: string | null
          programme_dates_start?: string | null
          programme_status: Database["public"]["Enums"]["cohort_programme_status"]
          public_label: string
          publish_status?: Database["public"]["Enums"]["cms_publish_status"]
          summary?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          media_url?: string | null
          programme_dates_end?: string | null
          programme_dates_start?: string | null
          programme_status?: Database["public"]["Enums"]["cohort_programme_status"]
          public_label?: string
          publish_status?: Database["public"]["Enums"]["cms_publish_status"]
          summary?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      cohort_partners: {
        Row: {
          cohort_id: string
          partner_id: string
        }
        Insert: {
          cohort_id: string
          partner_id: string
        }
        Update: {
          cohort_id?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_partners_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_startups: {
        Row: {
          cohort_id: string
          startup_id: string
        }
        Insert: {
          cohort_id: string
          startup_id: string
        }
        Update: {
          cohort_id?: string
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_startups_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_startups_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_startups_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups_public"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_stories: {
        Row: {
          created_at: string
          founder_quote_text: string | null
          id: string
          publish_status: Database["public"]["Enums"]["cms_publish_status"]
          quote_attribution_name: string | null
          quote_attribution_title: string | null
          quote_date: string | null
          quote_permission_status: Database["public"]["Enums"]["quote_permission_status"] | null
          startup_id: string
          the_asip_connection: string
          the_problem: string
          updated_at: string
          what_they_built: string
          where_they_are_now: string
        }
        Insert: {
          created_at?: string
          founder_quote_text?: string | null
          id?: string
          publish_status?: Database["public"]["Enums"]["cms_publish_status"]
          quote_attribution_name?: string | null
          quote_attribution_title?: string | null
          quote_date?: string | null
          quote_permission_status?: Database["public"]["Enums"]["quote_permission_status"] | null
          startup_id: string
          the_asip_connection: string
          the_problem: string
          updated_at?: string
          what_they_built: string
          where_they_are_now: string
        }
        Update: {
          created_at?: string
          founder_quote_text?: string | null
          id?: string
          publish_status?: Database["public"]["Enums"]["cms_publish_status"]
          quote_attribution_name?: string | null
          quote_attribution_title?: string | null
          quote_date?: string | null
          quote_permission_status?: Database["public"]["Enums"]["quote_permission_status"] | null
          startup_id?: string
          the_asip_connection?: string
          the_problem?: string
          updated_at?: string
          what_they_built?: string
          where_they_are_now?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_stories_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: true
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_stories_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: true
            referencedRelation: "startups_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          contribution: string | null
          created_at: string
          id: string
          is_active: boolean
          link: string | null
          logo_permission: boolean
          logo_url: string | null
          name: string
          org: string | null
          sort_order: number
          type: Database["public"]["Enums"]["partner_type"]
          updated_at: string
        }
        Insert: {
          contribution?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          link?: string | null
          logo_permission?: boolean
          logo_url?: string | null
          name: string
          org?: string | null
          sort_order?: number
          type: Database["public"]["Enums"]["partner_type"]
          updated_at?: string
        }
        Update: {
          contribution?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          link?: string | null
          logo_permission?: boolean
          logo_url?: string | null
          name?: string
          org?: string | null
          sort_order?: number
          type?: Database["public"]["Enums"]["partner_type"]
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          assets: string[]
          created_at: string
          event_date: string
          format: Database["public"]["Enums"]["event_format"] | null
          id: string
          location: string | null
          name: string
          outcomes: string | null
          publish_status: Database["public"]["Enums"]["cms_publish_status"]
          speakers: string[]
          updated_at: string
        }
        Insert: {
          assets?: string[]
          created_at?: string
          event_date: string
          format?: Database["public"]["Enums"]["event_format"] | null
          id?: string
          location?: string | null
          name: string
          outcomes?: string | null
          publish_status?: Database["public"]["Enums"]["cms_publish_status"]
          speakers?: string[]
          updated_at?: string
        }
        Update: {
          assets?: string[]
          created_at?: string
          event_date?: string
          format?: Database["public"]["Enums"]["event_format"] | null
          id?: string
          location?: string | null
          name?: string
          outcomes?: string | null
          publish_status?: Database["public"]["Enums"]["cms_publish_status"]
          speakers?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      event_startups: {
        Row: {
          event_id: string
          startup_id: string
        }
        Insert: {
          event_id: string
          startup_id: string
        }
        Update: {
          event_id?: string
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_startups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_startups_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_records: {
        Row: {
          created_at: string
          id: string
          last_verified_date: string
          measurement_period_end: string
          measurement_period_start: string
          owner_id: string
          permission: Database["public"]["Enums"]["evidence_permission"]
          primary_source: string
          review_date: string
          source_file_url: string | null
          status: Database["public"]["Enums"]["evidence_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_verified_date: string
          measurement_period_end: string
          measurement_period_start: string
          owner_id: string
          permission: Database["public"]["Enums"]["evidence_permission"]
          primary_source: string
          review_date: string
          source_file_url?: string | null
          status?: Database["public"]["Enums"]["evidence_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_verified_date?: string
          measurement_period_end?: string
          measurement_period_start?: string
          owner_id?: string
          permission?: Database["public"]["Enums"]["evidence_permission"]
          primary_source?: string
          review_date?: string
          source_file_url?: string | null
          status?: Database["public"]["Enums"]["evidence_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_records_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_metrics: {
        Row: {
          claim_label: string
          created_at: string
          display_locations: string[] | null
          evidence_id: string
          geography: string | null
          id: string
          impact_lens: Database["public"]["Enums"]["impact_lens"] | null
          period_end: string
          period_start: string
          publish_status: Database["public"]["Enums"]["evidence_status"]
          unit: string | null
          updated_at: string
          value: string
        }
        Insert: {
          claim_label: string
          created_at?: string
          display_locations?: string[] | null
          evidence_id: string
          geography?: string | null
          id?: string
          impact_lens?: Database["public"]["Enums"]["impact_lens"] | null
          period_end: string
          period_start: string
          publish_status?: Database["public"]["Enums"]["evidence_status"]
          unit?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          claim_label?: string
          created_at?: string
          display_locations?: string[] | null
          evidence_id?: string
          geography?: string | null
          id?: string
          impact_lens?: Database["public"]["Enums"]["impact_lens"] | null
          period_end?: string
          period_start?: string
          publish_status?: Database["public"]["Enums"]["evidence_status"]
          unit?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_metrics_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_records"
            referencedColumns: ["id"]
          },
        ]
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
          cohort: string | null
          country_code: string | null
          cover_image_url: string | null
          featured: boolean
          founder_names: string[]
          founding_year: number | null
          funding_goal: number | null
          image_focal_x: number
          image_focal_y: number
          industry: string | null
          location: string | null
          problem: string | null
          public_outcome: string | null
          sector: string | null
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
          cohort?: string | null
          country_code?: string | null
          cover_image_url?: string | null
          featured?: boolean
          founder_names?: string[]
          founding_year?: number | null
          funding_goal?: number | null
          image_focal_x?: number
          image_focal_y?: number
          industry?: string | null
          location?: string | null
          problem?: string | null
          public_outcome?: string | null
          sector?: string | null
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
          cohort?: string | null
          country_code?: string | null
          cover_image_url?: string | null
          featured?: boolean
          founder_names?: string[]
          founding_year?: number | null
          funding_goal?: number | null
          image_focal_x?: number
          image_focal_y?: number
          industry?: string | null
          location?: string | null
          problem?: string | null
          public_outcome?: string | null
          sector?: string | null
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
      partners_public: {
        Row: {
          id: string
          name: string
          org: string | null
          type: Database["public"]["Enums"]["partner_type"]
          link: string | null
          is_active: boolean
          sort_order: number
          logo_url: string | null
        }
        Relationships: []
      }
      startups_public: {
        Row: {
          category: string | null
          cohort: string | null
          country_code: string | null
          cover_image_url: string | null
          description: string
          featured: boolean
          founder_names: string[]
          founded_at: string | null
          id: string
          image_focal_x: number
          image_focal_y: number
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          public_outcome: string | null
          sector: string | null
          slug: string
          team: string | null
          updated_at: string
          website_url: string | null
        }
        Relationships: []
      }
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
      create_cohort_with_links: {
        Args: {
          p_cohort: Json
          p_partner_ids?: string[]
          p_startup_ids?: string[]
        }
        Returns: {
          id: string
        }[]
      }
      update_cohort_with_links: {
        Args: {
          p_id: string
          p_cohort: Json
          p_partner_ids?: string[]
          p_startup_ids?: string[]
        }
        Returns: {
          id: string
        }[]
      }
    }
    Enums: {
      blog_status: "draft" | "published"
      cms_publish_status: "draft" | "published"
      cohort_programme_status: "closed" | "open" | "hold"
      contact_enquiry_type: "founder" | "partner" | "media" | "general"
      evidence_permission:
        | "public"
        | "internal_only"
        | "partner_approval_required"
        | "legal_review_required"
      evidence_status:
        | "verified"
        | "pending"
        | "outdated"
        | "disputed"
        | "not_for_publication"
      event_format: "virtual" | "in_person" | "hybrid"
      impact_lens:
        | "pipeline"
        | "inclusion"
        | "business_growth"
        | "commercialisation"
        | "jobs_capability"
        | "sector_outcomes"
      partner_type:
        | "corporate"
        | "investors"
        | "technology"
        | "development"
        | "mentors"
        | "media"
      quote_permission_status: "granted" | "pending" | "denied"
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
      cms_publish_status: ["draft", "published"],
      cohort_programme_status: ["closed", "open", "hold"],
      contact_enquiry_type: ["founder", "partner", "media", "general"],
      evidence_permission: [
        "public",
        "internal_only",
        "partner_approval_required",
        "legal_review_required",
      ],
      evidence_status: [
        "verified",
        "pending",
        "outdated",
        "disputed",
        "not_for_publication",
      ],
      event_format: ["virtual", "in_person", "hybrid"],
      impact_lens: [
        "pipeline",
        "inclusion",
        "business_growth",
        "commercialisation",
        "jobs_capability",
        "sector_outcomes",
      ],
      partner_type: [
        "corporate",
        "investors",
        "technology",
        "development",
        "mentors",
        "media",
      ],
      quote_permission_status: ["granted", "pending", "denied"],
      startup_status: ["draft", "active", "inactive"],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const
