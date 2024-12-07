export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_restaurants: {
        Row: {
          created_at: string | null
          cuisine: string | null
          id: string
          image_url: string | null
          name: string
          place_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cuisine?: string | null
          id?: string
          image_url?: string | null
          name: string
          place_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cuisine?: string | null
          id?: string
          image_url?: string | null
          name?: string
          place_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_last_visited: {
        Row: {
          id: string
          place_id: string
          user_id: string
          visited_at: string | null
        }
        Insert: {
          id?: string
          place_id: string
          user_id: string
          visited_at?: string | null
        }
        Update: {
          id?: string
          place_id?: string
          user_id?: string
          visited_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          atmosphere_preferences: string[] | null
          created_at: string | null
          cuisine_preferences: string[] | null
          dietary_restrictions: string[] | null
          favorite_ingredients: string[] | null
          id: string
          preferred_dining_times: string[] | null
          price_range: Database["public"]["Enums"]["price_range"] | null
          special_considerations: string | null
          spice_level: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          atmosphere_preferences?: string[] | null
          created_at?: string | null
          cuisine_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          favorite_ingredients?: string[] | null
          id?: string
          preferred_dining_times?: string[] | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          special_considerations?: string | null
          spice_level?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          atmosphere_preferences?: string[] | null
          created_at?: string | null
          cuisine_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          favorite_ingredients?: string[] | null
          id?: string
          preferred_dining_times?: string[] | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          special_considerations?: string | null
          spice_level?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      price_range: "budget" | "moderate" | "upscale" | "luxury"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never
