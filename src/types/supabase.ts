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
      activities: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          id: string
          project_id: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          id?: string
          project_id?: string | null
          status: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          project_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string | null
          created_by: string | null
          deadline: string
          description: string | null
          form_type: string
          id: string
          project_id: string | null
          questions: Json | null
          status: string
          target_group: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deadline: string
          description?: string | null
          form_type: string
          id?: string
          project_id?: string | null
          questions?: Json | null
          status?: string
          target_group: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deadline?: string
          description?: string | null
          form_type?: string
          id?: string
          project_id?: string | null
          questions?: Json | null
          status?: string
          target_group?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      indicators: {
        Row: {
          category: Database["public"]["Enums"]["indicator_category"]
          created_at: string | null
          created_by: string | null
          current_value: number | null
          data_collection_method: string | null
          description: string | null
          frequency: Database["public"]["Enums"]["measurement_frequency"]
          id: string
          name: string
          project_id: string | null
          sdg_goals: number[] | null
          start_value: number | null
          target_value: number | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["indicator_category"]
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          data_collection_method?: string | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["measurement_frequency"]
          id?: string
          name: string
          project_id?: string | null
          sdg_goals?: number[] | null
          start_value?: number | null
          target_value?: number | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["indicator_category"]
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          data_collection_method?: string | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["measurement_frequency"]
          id?: string
          name?: string
          project_id?: string | null
          sdg_goals?: number[] | null
          start_value?: number | null
          target_value?: number | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          indicator_id: string | null
          notes: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          indicator_id?: string | null
          notes?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          indicator_id?: string | null
          notes?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "measurements_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          organization: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          organization?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          organization?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      project_images: {
        Row: {
          created_at: string | null
          created_by: string | null
          file_name: string
          file_path: string
          id: string
          project_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          file_name: string
          file_path: string
          id?: string
          project_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          file_name?: string
          file_path?: string
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_indicators: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          project_id: string
          unit: string
          updated_at: string | null
          value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          project_id: string
          unit: string
          updated_at?: string | null
          value?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          project_id?: string
          unit?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_indicators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_sdgs: {
        Row: {
          contribution_level: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          project_id: string | null
          sdg_number: number
        }
        Insert: {
          contribution_level: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          project_id?: string | null
          sdg_number: number
        }
        Update: {
          contribution_level?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          project_id?: string | null
          sdg_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_sdgs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number
          category: Database["public"]["Enums"]["project_category"]
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          location: string
          manager: string
          name: string
          sdgs: number[] | null
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string | null
        }
        Insert: {
          budget?: number
          category: Database["public"]["Enums"]["project_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          location: string
          manager: string
          name: string
          sdgs?: number[] | null
          start_date: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string | null
        }
        Update: {
          budget?: number
          category?: Database["public"]["Enums"]["project_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          location?: string
          manager?: string
          name?: string
          sdgs?: number[] | null
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
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
      indicator_category: "Quantitative" | "Qualitative"
      measurement_frequency:
        | "Daily"
        | "Weekly"
        | "Monthly"
        | "Quarterly"
        | "Annually"
      project_category: "Environmental" | "Social" | "Governance"
      project_status: "Planning" | "Active" | "Completed" | "Cancelled"
      user_role: "admin" | "contributor" | "reviewer"
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
    Enums: {
      indicator_category: ["Quantitative", "Qualitative"],
      measurement_frequency: [
        "Daily",
        "Weekly",
        "Monthly",
        "Quarterly",
        "Annually",
      ],
      project_category: ["Environmental", "Social", "Governance"],
      project_status: ["Planning", "Active", "Completed", "Cancelled"],
      user_role: ["admin", "contributor", "reviewer"],
    },
  },
} as const
