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
      banking_accounts: {
        Row: {
          account_number_masked: string | null
          app_url: string | null
          balance_usd: number
          card_last_four: string | null
          card_status: string
          created_at: string
          id: string
          order_id: string
          provider: string
          status: string
        }
        Insert: {
          account_number_masked?: string | null
          app_url?: string | null
          balance_usd?: number
          card_last_four?: string | null
          card_status?: string
          created_at?: string
          id?: string
          order_id: string
          provider: string
          status?: string
        }
        Update: {
          account_number_masked?: string | null
          app_url?: string | null
          balance_usd?: number
          card_last_four?: string | null
          card_status?: string
          created_at?: string
          id?: string
          order_id?: string
          provider?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "banking_accounts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      banking_transactions: {
        Row: {
          account_id: string
          amount_usd: number
          created_at: string
          description: string
          direction: string
          id: string
          occurred_at: string
        }
        Insert: {
          account_id: string
          amount_usd: number
          created_at?: string
          description: string
          direction?: string
          id?: string
          occurred_at?: string
        }
        Update: {
          account_id?: string
          amount_usd?: number
          created_at?: string
          description?: string
          direction?: string
          id?: string
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banking_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "banking_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          id: string
          name_ar: string
          name_en: string
          name_fr: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_ar: string
          name_en: string
          name_fr: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string
          name_fr?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          body_ar: string
          body_en: string
          body_fr: string
          category_id: string | null
          cover_url: string | null
          created_at: string
          excerpt_ar: string
          excerpt_en: string
          excerpt_fr: string
          id: string
          og_image: string | null
          published_at: string | null
          reading_minutes: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[]
          title_ar: string
          title_en: string
          title_fr: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body_ar?: string
          body_en?: string
          body_fr?: string
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt_ar?: string
          excerpt_en?: string
          excerpt_fr?: string
          id?: string
          og_image?: string | null
          published_at?: string | null
          reading_minutes?: number
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[]
          title_ar?: string
          title_en: string
          title_fr?: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body_ar?: string
          body_en?: string
          body_fr?: string
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt_ar?: string
          excerpt_en?: string
          excerpt_fr?: string
          id?: string
          og_image?: string | null
          published_at?: string | null
          reading_minutes?: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title_ar?: string
          title_en?: string
          title_fr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_events: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          id: string
          order_id: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          order_id: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          order_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          client_id: string
          course_slug: string
          created_at: string
          id: string
          progress_pct: number
          updated_at: string
        }
        Insert: {
          client_id: string
          course_slug: string
          created_at?: string
          id?: string
          progress_pct?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          course_slug?: string
          created_at?: string
          id?: string
          progress_pct?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          direction: string
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          notes: string | null
          order_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          type: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          direction?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          notes?: string | null
          order_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          type: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          notes?: string | null
          order_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          type?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string
          id: string
          invoice_number: string | null
          order_id: string | null
          pdf_path: string | null
          status: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string
          id?: string
          invoice_number?: string | null
          order_id?: string | null
          pdf_path?: string | null
          status?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          id?: string
          invoice_number?: string | null
          order_id?: string | null
          pdf_path?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          order_id: string
          read_at: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          order_id: string
          read_at?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          order_id?: string
          read_at?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          academy_email: boolean
          client_id: string
          compliance_email: boolean
          compliance_whatsapp: boolean
          documents_email: boolean
          gateway_email: boolean
          gateway_whatsapp: boolean
          marketing_email: boolean
          updated_at: string
        }
        Insert: {
          academy_email?: boolean
          client_id: string
          compliance_email?: boolean
          compliance_whatsapp?: boolean
          documents_email?: boolean
          gateway_email?: boolean
          gateway_whatsapp?: boolean
          marketing_email?: boolean
          updated_at?: string
        }
        Update: {
          academy_email?: boolean
          client_id?: string
          compliance_email?: boolean
          compliance_whatsapp?: boolean
          documents_email?: boolean
          gateway_email?: boolean
          gateway_whatsapp?: boolean
          marketing_email?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          client_id: string
          created_at: string
          id: string
          is_read: boolean
          order_id: string | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          order_id?: string | null
          title: string
          type?: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          order_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_timeline: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note_ar: string | null
          note_en: string | null
          note_fr: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note_ar?: string | null
          note_en?: string | null
          note_fr?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note_ar?: string | null
          note_en?: string | null
          note_fr?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          amount_paid: number | null
          amount_usd: number | null
          assigned_to: string | null
          banking_done_at: string | null
          business_desc: string | null
          business_name: string | null
          business_type: string | null
          client_id: string
          client_notes: string | null
          completed_at: string | null
          created_at: string
          currency_paid: string | null
          ein_received_at: string | null
          filed_at: string | null
          id: string
          industry: string | null
          intake: Json
          order_number: string | null
          paid_at: string | null
          payment_status: string | null
          preferred_channel: string | null
          preferred_contact_time: string | null
          service_id: string
          state_fee_usd: number | null
          status: string
          stripe_payment_intent: string | null
          submitted_at: string | null
          total_usd: number | null
          updated_at: string
          us_state: string | null
          workspace_name: string | null
          workspace_status: string
        }
        Insert: {
          admin_notes?: string | null
          amount_paid?: number | null
          amount_usd?: number | null
          assigned_to?: string | null
          banking_done_at?: string | null
          business_desc?: string | null
          business_name?: string | null
          business_type?: string | null
          client_id: string
          client_notes?: string | null
          completed_at?: string | null
          created_at?: string
          currency_paid?: string | null
          ein_received_at?: string | null
          filed_at?: string | null
          id?: string
          industry?: string | null
          intake?: Json
          order_number?: string | null
          paid_at?: string | null
          payment_status?: string | null
          preferred_channel?: string | null
          preferred_contact_time?: string | null
          service_id: string
          state_fee_usd?: number | null
          status?: string
          stripe_payment_intent?: string | null
          submitted_at?: string | null
          total_usd?: number | null
          updated_at?: string
          us_state?: string | null
          workspace_name?: string | null
          workspace_status?: string
        }
        Update: {
          admin_notes?: string | null
          amount_paid?: number | null
          amount_usd?: number | null
          assigned_to?: string | null
          banking_done_at?: string | null
          business_desc?: string | null
          business_name?: string | null
          business_type?: string | null
          client_id?: string
          client_notes?: string | null
          completed_at?: string | null
          created_at?: string
          currency_paid?: string | null
          ein_received_at?: string | null
          filed_at?: string | null
          id?: string
          industry?: string | null
          intake?: Json
          order_number?: string | null
          paid_at?: string | null
          payment_status?: string | null
          preferred_channel?: string | null
          preferred_contact_time?: string | null
          service_id?: string
          state_fee_usd?: number | null
          status?: string
          stripe_payment_intent?: string | null
          submitted_at?: string | null
          total_usd?: number | null
          updated_at?: string
          us_state?: string | null
          workspace_name?: string | null
          workspace_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_postal: string | null
          address_state: string | null
          address_street: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          currency: string | null
          date_of_birth: string | null
          email: string
          flag_emoji: string | null
          full_name: string | null
          id: string
          id_type: string | null
          language: string | null
          phone: string | null
          updated_at: string
          whatsapp: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_postal?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          date_of_birth?: string | null
          email: string
          flag_emoji?: string | null
          full_name?: string | null
          id: string
          id_type?: string | null
          language?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_postal?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          date_of_birth?: string | null
          email?: string
          flag_emoji?: string | null
          full_name?: string | null
          id?: string
          id_type?: string | null
          language?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      renewals: {
        Row: {
          amount: number | null
          auto_renew: boolean
          created_at: string
          due_date: string
          id: string
          order_id: string
          status: string
          type: string
        }
        Insert: {
          amount?: number | null
          auto_renew?: boolean
          created_at?: string
          due_date: string
          id?: string
          order_id: string
          status?: string
          type: string
        }
        Update: {
          amount?: number | null
          auto_renew?: boolean
          created_at?: string
          due_date?: string
          id?: string
          order_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "renewals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          badge_key: string | null
          created_at: string
          delivery_days: number | null
          description_ar: string | null
          description_en: string | null
          description_fr: string | null
          features: Json | null
          group_key: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          name_fr: string | null
          original_price_mad: number | null
          price_mad: number | null
          price_usd: number
          slug: string
          sort_order: number | null
          state_fee_usd: number | null
          tier: string | null
          us_state: string | null
        }
        Insert: {
          badge_key?: string | null
          created_at?: string
          delivery_days?: number | null
          description_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          features?: Json | null
          group_key?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          name_fr?: string | null
          original_price_mad?: number | null
          price_mad?: number | null
          price_usd: number
          slug: string
          sort_order?: number | null
          state_fee_usd?: number | null
          tier?: string | null
          us_state?: string | null
        }
        Update: {
          badge_key?: string | null
          created_at?: string
          delivery_days?: number | null
          description_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          features?: Json | null
          group_key?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          name_fr?: string | null
          original_price_mad?: number | null
          price_mad?: number | null
          price_usd?: number
          slug?: string
          sort_order?: number | null
          state_fee_usd?: number | null
          tier?: string | null
          us_state?: string | null
        }
        Relationships: []
      }
      store_items: {
        Row: {
          category: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          description_fr: string | null
          id: string
          is_active: boolean
          name_ar: string | null
          name_en: string
          name_fr: string | null
          price_mad: number
          sort_order: number
        }
        Insert: {
          category: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string | null
          name_en: string
          name_fr?: string | null
          price_mad: number
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string | null
          name_en?: string
          name_fr?: string | null
          price_mad?: number
          sort_order?: number
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "client" | "admin" | "support"
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
      app_role: ["client", "admin", "support"],
    },
  },
} as const
