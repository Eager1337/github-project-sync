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
      ai_drafts: {
        Row: {
          category: string | null
          colors: string[]
          created_at: string
          description: string | null
          error: string | null
          id: string
          images: string[]
          name: string | null
          price: number
          published_product_id: string | null
          sizes: string[]
          status: string
          stock: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          colors?: string[]
          created_at?: string
          description?: string | null
          error?: string | null
          id?: string
          images?: string[]
          name?: string | null
          price?: number
          published_product_id?: string | null
          sizes?: string[]
          status?: string
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          colors?: string[]
          created_at?: string
          description?: string | null
          error?: string | null
          id?: string
          images?: string[]
          name?: string | null
          price?: number
          published_product_id?: string | null
          sizes?: string[]
          status?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_drafts_published_product_id_fkey"
            columns: ["published_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      daily_uploads: {
        Row: {
          count: number
          id: string
          upload_date: string
        }
        Insert: {
          count?: number
          id?: string
          upload_date?: string
        }
        Update: {
          count?: number
          id?: string
          upload_date?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string
          file_name: string | null
          id: string
          media_type: string
          path: string
          size_bytes: number | null
          url: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          id?: string
          media_type?: string
          path: string
          size_bytes?: number | null
          url: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          id?: string
          media_type?: string
          path?: string
          size_bytes?: number | null
          url?: string
        }
        Relationships: []
      }
      notification_schedules: {
        Row: {
          active: boolean
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          interval_seconds: number
          link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          interval_seconds?: number
          link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          interval_seconds?: number
          link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          link: string | null
          product_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          link?: string | null
          product_id?: string | null
          title: string
          type?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          link?: string | null
          product_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          order_id: string
          price?: number
          product_id?: string | null
          quantity?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          created_at: string
          customer_name: string
          guest_token: string
          id: string
          note: string | null
          order_number: string
          phone: string
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_name: string
          guest_token: string
          id?: string
          note?: string | null
          order_number: string
          phone: string
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_name?: string
          guest_token?: string
          id?: string
          note?: string | null
          order_number?: string
          phone?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          changed_at: string
          id: string
          new_price: number
          note: string | null
          old_price: number | null
          product_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          new_price: number
          note?: string | null
          old_price?: number | null
          product_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          new_price?: number
          note?: string | null
          old_price?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          colors: string[]
          created_at: string
          description: string | null
          featured: boolean
          id: string
          images: string[] | null
          is_highlight: boolean
          low_stock_threshold: number
          name: string
          price: number
          published: boolean
          sizes: string[]
          stock: number
          tiktok_url: string | null
          updated_at: string
          videos: string[] | null
        }
        Insert: {
          category: string
          colors?: string[]
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          images?: string[] | null
          is_highlight?: boolean
          low_stock_threshold?: number
          name: string
          price?: number
          published?: boolean
          sizes?: string[]
          stock?: number
          tiktok_url?: string | null
          updated_at?: string
          videos?: string[] | null
        }
        Update: {
          category?: string
          colors?: string[]
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          images?: string[] | null
          is_highlight?: boolean
          low_stock_threshold?: number
          name?: string
          price?: number
          published?: boolean
          sizes?: string[]
          stock?: number
          tiktok_url?: string | null
          updated_at?: string
          videos?: string[] | null
        }
        Relationships: []
      }
      push_subscribers: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      scheduled_changes: {
        Row: {
          applied: boolean
          change_type: string
          created_at: string
          id: string
          new_price: number | null
          note: string | null
          product_id: string | null
          release_at: string
          updated_at: string
        }
        Insert: {
          applied?: boolean
          change_type?: string
          created_at?: string
          id?: string
          new_price?: number | null
          note?: string | null
          product_id?: string | null
          release_at: string
          updated_at?: string
        }
        Update: {
          applied?: boolean
          change_type?: string
          created_at?: string
          id?: string
          new_price?: number | null
          note?: string | null
          product_id?: string | null
          release_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_changes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          photo_url: string | null
          published: boolean
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          published?: boolean
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          published?: boolean
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author: string
          avatar_url: string | null
          created_at: string
          id: string
          published: boolean
          quote: string
          rating: number
          updated_at: string
        }
        Insert: {
          author: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          published?: boolean
          quote: string
          rating?: number
          updated_at?: string
        }
        Update: {
          author?: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          published?: boolean
          quote?: string
          rating?: number
          updated_at?: string
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
