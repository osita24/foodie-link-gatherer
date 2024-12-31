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
      oauth_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recipe_community_insights: {
        Row: {
          created_at: string | null
          id: string
          insight_type: string
          processed_insight: string
          recipe_id: string | null
          source_comment: string
          updated_at: string | null
          votes: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          insight_type: string
          processed_insight: string
          recipe_id?: string | null
          source_comment: string
          updated_at?: string | null
          votes?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          insight_type?: string
          processed_insight?: string
          recipe_id?: string | null
          source_comment?: string
          updated_at?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_community_insights_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredient_sources: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          processed_ingredients: Json | null
          raw_text: string
          recipe_id: string | null
          source_type: string
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          processed_ingredients?: Json | null
          raw_text: string
          recipe_id?: string | null
          source_type: string
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          processed_ingredients?: Json | null
          raw_text?: string
          recipe_id?: string | null
          source_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredient_sources_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time: number | null
          cooking_tips: string[] | null
          created_at: string | null
          cuisine_type: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          ingredient_confidence: number | null
          ingredient_source: string | null
          ingredients: Json | null
          instructions: Json | null
          nutrition_info: Json
          prep_time: number | null
          servings: number | null
          timestamp_source: string | null
          timestamps: Json | null
          title: string
          updated_at: string | null
          user_id: string | null
          video_id: string
        }
        Insert: {
          cook_time?: number | null
          cooking_tips?: string[] | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          ingredient_confidence?: number | null
          ingredient_source?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          nutrition_info?: Json
          prep_time?: number | null
          servings?: number | null
          timestamp_source?: string | null
          timestamps?: Json | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          video_id: string
        }
        Update: {
          cook_time?: number | null
          cooking_tips?: string[] | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          ingredient_confidence?: number | null
          ingredient_source?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          nutrition_info?: Json
          prep_time?: number | null
          servings?: number | null
          timestamp_source?: string | null
          timestamps?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          video_id?: string
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          recipe_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          recipe_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          recipe_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_restaurants: {
        Row: {
          address: string | null
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
          address?: string | null
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
          address?: string | null
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
      similar_restaurants: {
        Row: {
          created_at: string | null
          id: string
          place_id: string
          similar_place_id: string
          similarity_score: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          place_id: string
          similar_place_id: string
          similarity_score: number
        }
        Update: {
          created_at?: string | null
          id?: string
          place_id?: string
          similar_place_id?: string
          similarity_score?: number
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
          favorite_proteins: string[] | null
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
          favorite_proteins?: string[] | null
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
          favorite_proteins?: string[] | null
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
      video_analysis: {
        Row: {
          created_at: string | null
          engagement_score: number | null
          id: string
          timestamps: Json
          user_feedback: string[] | null
          user_id: string | null
          video_id: string
        }
        Insert: {
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          timestamps: Json
          user_feedback?: string[] | null
          user_id?: string | null
          video_id: string
        }
        Update: {
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          timestamps?: Json
          user_feedback?: string[] | null
          user_id?: string | null
          video_id?: string
        }
        Relationships: []
      }
      video_raw_data: {
        Row: {
          captions: Json | null
          chapters: Json | null
          created_at: string | null
          description: string | null
          id: string
          recipe_comments: Json | null
          updated_at: string | null
          video_id: string
        }
        Insert: {
          captions?: Json | null
          chapters?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          recipe_comments?: Json | null
          updated_at?: string | null
          video_id: string
        }
        Update: {
          captions?: Json | null
          chapters?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          recipe_comments?: Json | null
          updated_at?: string | null
          video_id?: string
        }
        Relationships: []
      }
      video_transcriptions: {
        Row: {
          created_at: string | null
          id: string
          transcript: Json
          updated_at: string | null
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          transcript: Json
          updated_at?: string | null
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          transcript?: Json
          updated_at?: string | null
          video_id?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
