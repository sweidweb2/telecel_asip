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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_perf_events: {
        Row: {
          cache_status: string
          created_at: string
          db_ms: number | null
          duration_ms: number
          error_message: string | null
          event_type: string
          id: string
          meta: Json
          name: string
          ok: boolean
          parent_id: string | null
          request_id: string
          route: string | null
        }
        Insert: {
          cache_status: string
          created_at?: string
          db_ms?: number | null
          duration_ms: number
          error_message?: string | null
          event_type: string
          id?: string
          meta?: Json
          name: string
          ok?: boolean
          parent_id?: string | null
          request_id: string
          route?: string | null
        }
        Update: {
          cache_status?: string
          created_at?: string
          db_ms?: number | null
          duration_ms?: number
          error_message?: string | null
          event_type?: string
          id?: string
          meta?: Json
          name?: string
          ok?: boolean
          parent_id?: string | null
          request_id?: string
          route?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_perf_events_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "admin_perf_events"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          comms_opt_in: boolean
          company_country: string
          company_name: string
          consent: boolean
          country: string
          created_at: string
          email: string
          founder_role: string
          full_name: string
          id: string
          inbox_status: Database["public"]["Enums"]["inbox_status"]
          linkedin: string | null
          phone: string
          problem_product: string
          programme_fit: string
          sector: string
          traction: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          comms_opt_in?: boolean
          company_country: string
          company_name: string
          consent: boolean
          country: string
          created_at?: string
          email: string
          founder_role: string
          full_name: string
          id?: string
          inbox_status?: Database["public"]["Enums"]["inbox_status"]
          linkedin?: string | null
          phone: string
          problem_product: string
          programme_fit: string
          sector: string
          traction: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          comms_opt_in?: boolean
          company_country?: string
          company_name?: string
          consent?: boolean
          country?: string
          created_at?: string
          email?: string
          founder_role?: string
          full_name?: string
          id?: string
          inbox_status?: Database["public"]["Enums"]["inbox_status"]
          linkedin?: string | null
          phone?: string
          problem_product?: string
          programme_fit?: string
          sector?: string
          traction?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      backups: {
        Row: {
          created_at: string
          error_message: string | null
          file_path: string | null
          file_size: number | null
          format: Database["public"]["Enums"]["backup_format"]
          id: string
          schedule_window: string | null
          scope: Database["public"]["Enums"]["backup_scope"]
          status: Database["public"]["Enums"]["backup_status"]
          target_tables: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          format: Database["public"]["Enums"]["backup_format"]
          id?: string
          schedule_window?: string | null
          scope: Database["public"]["Enums"]["backup_scope"]
          status?: Database["public"]["Enums"]["backup_status"]
          target_tables?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          format?: Database["public"]["Enums"]["backup_format"]
          id?: string
          schedule_window?: string | null
          scope?: Database["public"]["Enums"]["backup_scope"]
          status?: Database["public"]["Enums"]["backup_status"]
          target_tables?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          body_html: string
          categories: string[]
          cohort_id: string | null
          created_at: string
          id: string
          is_featured: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number
          slug: string
          sources: string[]
          startup_id: string | null
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
          cohort_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          slug: string
          sources?: string[]
          startup_id?: string | null
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
          cohort_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          slug?: string
          sources?: string[]
          startup_id?: string | null
          status?: Database["public"]["Enums"]["blog_status"]
          summary?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blogs_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blogs_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups_public"
            referencedColumns: ["id"]
          },
        ]
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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          enquiry_type: Database["public"]["Enums"]["contact_enquiry_type"]
          full_name: string
          id: string
          inbox_status: Database["public"]["Enums"]["inbox_status"]
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
          inbox_status?: Database["public"]["Enums"]["inbox_status"]
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
          inbox_status?: Database["public"]["Enums"]["inbox_status"]
          message?: string
          phone?: string
          subject?: string
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
          {
            foreignKeyName: "event_startups_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups_public"
            referencedColumns: ["id"]
          },
        ]
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
      founder_stories: {
        Row: {
          cover_image_url: string | null
          created_at: string
          founder_quote_text: string | null
          headline_stat: string | null
          id: string
          publish_status: Database["public"]["Enums"]["cms_publish_status"]
          quote_attribution_name: string | null
          quote_attribution_title: string | null
          quote_date: string | null
          quote_permission_status:
            | Database["public"]["Enums"]["quote_permission_status"]
            | null
          startup_id: string
          story_title: string | null
          the_asip_connection: string
          the_problem: string
          updated_at: string
          what_they_built: string
          where_they_are_now: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          founder_quote_text?: string | null
          headline_stat?: string | null
          id?: string
          publish_status?: Database["public"]["Enums"]["cms_publish_status"]
          quote_attribution_name?: string | null
          quote_attribution_title?: string | null
          quote_date?: string | null
          quote_permission_status?:
            | Database["public"]["Enums"]["quote_permission_status"]
            | null
          startup_id: string
          story_title?: string | null
          the_asip_connection: string
          the_problem: string
          updated_at?: string
          what_they_built: string
          where_they_are_now: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          founder_quote_text?: string | null
          headline_stat?: string | null
          id?: string
          publish_status?: Database["public"]["Enums"]["cms_publish_status"]
          quote_attribution_name?: string | null
          quote_attribution_title?: string | null
          quote_date?: string | null
          quote_permission_status?:
            | Database["public"]["Enums"]["quote_permission_status"]
            | null
          startup_id?: string
          story_title?: string | null
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
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_stories_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups_public"
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
      interest_registrations: {
        Row: {
          comms_opt_in: boolean
          company_country: string
          company_name: string
          consent: boolean
          consent_version: string
          country: string
          created_at: string
          email: string
          founder_role: string | null
          full_name: string
          id: string
          inbox_status: Database["public"]["Enums"]["inbox_status"]
          linkedin: string | null
          locale: string
          phone: string
          pitch: string | null
          sector: string
          source_path: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          comms_opt_in?: boolean
          company_country: string
          company_name: string
          consent: boolean
          consent_version?: string
          country: string
          created_at?: string
          email: string
          founder_role?: string | null
          full_name: string
          id?: string
          inbox_status?: Database["public"]["Enums"]["inbox_status"]
          linkedin?: string | null
          locale?: string
          phone: string
          pitch?: string | null
          sector: string
          source_path?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          comms_opt_in?: boolean
          company_country?: string
          company_name?: string
          consent?: boolean
          consent_version?: string
          country?: string
          created_at?: string
          email?: string
          founder_role?: string | null
          full_name?: string
          id?: string
          inbox_status?: Database["public"]["Enums"]["inbox_status"]
          linkedin?: string | null
          locale?: string
          phone?: string
          pitch?: string | null
          sector?: string
          source_path?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          id: string
          source_page: string | null
        }
        Insert: {
          consent: boolean
          created_at?: string
          email: string
          id?: string
          source_page?: string | null
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          source_page?: string | null
        }
        Relationships: []
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
      rate_limit_buckets: {
        Row: {
          bucket_key: string
          hits: number[]
          updated_at: string
        }
        Insert: {
          bucket_key: string
          hits?: number[]
          updated_at?: string
        }
        Update: {
          bucket_key?: string
          hits?: number[]
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          backup_time: Database["public"]["Enums"]["backup_schedule"]
          id: number
          newsletter_signup_enabled: boolean
          open_applications: boolean
          updated_at: string
        }
        Insert: {
          backup_time?: Database["public"]["Enums"]["backup_schedule"]
          id?: number
          newsletter_signup_enabled?: boolean
          open_applications?: boolean
          updated_at?: string
        }
        Update: {
          backup_time?: Database["public"]["Enums"]["backup_schedule"]
          id?: number
          newsletter_signup_enabled?: boolean
          open_applications?: boolean
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
          {
            foreignKeyName: "startup_details_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: true
            referencedRelation: "startups_public"
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
    }
    Views: {
      partners_public: {
        Row: {
          id: string | null
          is_active: boolean | null
          link: string | null
          logo_url: string | null
          name: string | null
          org: string | null
          sort_order: number | null
          type: Database["public"]["Enums"]["partner_type"] | null
        }
        Insert: {
          id?: string | null
          is_active?: boolean | null
          link?: string | null
          logo_url?: never
          name?: string | null
          org?: string | null
          sort_order?: number | null
          type?: Database["public"]["Enums"]["partner_type"] | null
        }
        Update: {
          id?: string | null
          is_active?: boolean | null
          link?: string | null
          logo_url?: never
          name?: string | null
          org?: string | null
          sort_order?: number | null
          type?: Database["public"]["Enums"]["partner_type"] | null
        }
        Relationships: []
      }
      site_settings_public: {
        Row: {
          id: number | null
          newsletter_signup_enabled: boolean | null
          open_applications: boolean | null
        }
        Insert: {
          id?: number | null
          newsletter_signup_enabled?: never
          open_applications?: never
        }
        Update: {
          id?: number | null
          newsletter_signup_enabled?: never
          open_applications?: never
        }
        Relationships: []
      }
      startups_public: {
        Row: {
          category: string | null
          cohort: string | null
          country_code: string | null
          cover_image_url: string | null
          description: string | null
          featured: boolean | null
          founded_at: string | null
          founder_names: string[] | null
          id: string | null
          image_focal_x: number | null
          image_focal_y: number | null
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string | null
          public_outcome: string | null
          sector: string | null
          slug: string | null
          team: string | null
          updated_at: string | null
          website_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_hard_delete_user: { Args: { p_target: string }; Returns: undefined }
      blog_categories_within_bounds: {
        Args: { categories: string[] }
        Returns: boolean
      }
      blog_sources_within_bounds: {
        Args: { sources: string[] }
        Returns: boolean
      }
      consume_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_ms: number }
        Returns: boolean
      }
      create_blog_with_featured: {
        Args: { p_blog: Json }
        Returns: {
          id: string
          slug: string
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
      create_event_with_links: {
        Args: { p_event: Json; p_startup_ids?: string[] }
        Returns: {
          id: string
        }[]
      }
      create_startup_with_details: {
        Args: { p_core: Json; p_details: Json }
        Returns: {
          id: string
          slug: string
        }[]
      }
      get_active_startup_filter_options: { Args: never; Returns: Json }
      get_admin_analytics: { Args: never; Returns: Json }
      get_admin_backup_schedule: {
        Args: never
        Returns: Database["public"]["Enums"]["backup_schedule"]
      }
      get_admin_list_stats: { Args: { p_resource: string }; Returns: Json }
      get_admin_shell: {
        Args: never
        Returns: {
          email: string
          full_name: string
          is_admin: boolean
          is_editor: boolean
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_dashboard_nav_counts: { Args: never; Returns: Json }
      get_related_published_blogs: {
        Args: { p_limit?: number; p_slug: string }
        Returns: {
          author_avatar_url: string
          author_name: string
          categories: string[]
          id: string
          is_featured: boolean
          published_at: string
          reading_time_minutes: number
          slug: string
          summary: string
          thumbnail_url: string
          title: string
        }[]
      }
      get_staff_shell: {
        Args: never
        Returns: {
          email: string
          full_name: string
          is_admin: boolean
          is_editor: boolean
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_user_stats: {
        Args: never
        Returns: {
          admins: number
          editors: number
          new_this_month: number
          new_this_week: number
          total: number
          viewers: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_editor: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      update_blog_with_featured: {
        Args: { p_blog: Json; p_id: string }
        Returns: {
          id: string
          previous_slug: string
          slug: string
        }[]
      }
      update_cohort_with_links: {
        Args: {
          p_cohort: Json
          p_id: string
          p_partner_ids?: string[]
          p_startup_ids?: string[]
        }
        Returns: {
          id: string
        }[]
      }
      update_event_with_links: {
        Args: { p_event: Json; p_id: string; p_startup_ids?: string[] }
        Returns: {
          id: string
        }[]
      }
      update_startup_with_details: {
        Args: { p_core: Json; p_details: Json; p_id: string }
        Returns: {
          id: string
          previous_slug: string
          slug: string
        }[]
      }
    }
    Enums: {
      backup_format: "json" | "csv" | "sql" | "zip"
      backup_schedule:
        | "off"
        | "daily_00"
        | "daily_03"
        | "daily_06"
        | "daily_12"
        | "daily_18"
        | "weekly_sun_03"
        | "weekly_mon_03"
      backup_scope: "full" | "tables" | "storage" | "automated"
      backup_status: "pending" | "processing" | "completed" | "failed"
      blog_status: "draft" | "published"
      cms_publish_status: "draft" | "published"
      cohort_programme_status: "closed" | "open" | "hold"
      contact_enquiry_type: "founder" | "partner" | "media" | "general"
      event_format: "virtual" | "in_person" | "hybrid"
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
      impact_lens:
        | "pipeline"
        | "inclusion"
        | "business_growth"
        | "commercialisation"
        | "jobs_capability"
        | "sector_outcomes"
      inbox_status: "unread" | "reviewed" | "archived"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      backup_format: ["json", "csv", "sql", "zip"],
      backup_schedule: [
        "off",
        "daily_00",
        "daily_03",
        "daily_06",
        "daily_12",
        "daily_18",
        "weekly_sun_03",
        "weekly_mon_03",
      ],
      backup_scope: ["full", "tables", "storage", "automated"],
      backup_status: ["pending", "processing", "completed", "failed"],
      blog_status: ["draft", "published"],
      cms_publish_status: ["draft", "published"],
      cohort_programme_status: ["closed", "open", "hold"],
      contact_enquiry_type: ["founder", "partner", "media", "general"],
      event_format: ["virtual", "in_person", "hybrid"],
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
      impact_lens: [
        "pipeline",
        "inclusion",
        "business_growth",
        "commercialisation",
        "jobs_capability",
        "sector_outcomes",
      ],
      inbox_status: ["unread", "reviewed", "archived"],
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
