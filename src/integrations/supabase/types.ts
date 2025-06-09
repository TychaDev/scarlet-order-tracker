export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      order_history: {
        Row: {
          archived_reason: string | null
          completed_at: string | null
          created_at: string
          customer_address: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          items: Json | null
          order_number: string
          original_order_id: string
          payment_method: string | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          archived_reason?: string | null
          completed_at?: string | null
          created_at: string
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json | null
          order_number: string
          original_order_id: string
          payment_method?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          archived_reason?: string | null
          completed_at?: string | null
          created_at?: string
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json | null
          order_number?: string
          original_order_id?: string
          payment_method?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          items: Json | null
          order_number: string
          payment_method: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          updated_status_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json | null
          order_number: string
          payment_method?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          updated_status_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json | null
          order_number?: string
          payment_method?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          updated_status_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          custom_description: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number | null
          stock_quantity: number | null
          updated_at: string | null
          xml_data: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          custom_description?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          xml_data?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          custom_description?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          xml_data?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          admin_password_hash: string
          created_at: string | null
          id: string
          manager_email: string | null
          manager_name: string | null
          updated_at: string | null
        }
        Insert: {
          admin_password_hash: string
          created_at?: string | null
          id?: string
          manager_email?: string | null
          manager_name?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_password_hash?: string
          created_at?: string | null
          id?: string
          manager_email?: string | null
          manager_name?: string | null
          updated_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
