export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      levels: {
        Row: {
          id: number
          level_number: number
          level_name: string
          salary_min: number
          salary_max: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          level_number: number
          level_name: string
          salary_min: number
          salary_max: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          level_number?: number
          level_name?: string
          salary_min?: number
          salary_max?: number
          created_at?: string
          updated_at?: string
        }
      }
      developers: {
        Row: {
          id: number
          name: string
          email: string
          current_level: number
          current_salary: number
          hire_date: string | null
          last_review_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          current_level: number
          current_salary: number
          hire_date?: string | null
          last_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          current_level?: number
          current_salary?: number
          hire_date?: string | null
          last_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      criteria_definitions: {
        Row: {
          id: number
          from_level: number
          to_level: number
          category: string
          criterion_key: string
          criterion_name: string
          criterion_description: string
          is_required: boolean
          created_at: string
        }
        Insert: {
          id?: number
          from_level: number
          to_level: number
          category: string
          criterion_key: string
          criterion_name: string
          criterion_description: string
          is_required?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          from_level?: number
          to_level?: number
          category?: string
          criterion_key?: string
          criterion_name?: string
          criterion_description?: string
          is_required?: boolean
          created_at?: string
        }
      }
      developer_criteria: {
        Row: {
          id: number
          developer_id: number
          from_level: number
          to_level: number
          category: string
          criterion_key: string
          is_met: boolean
          reviewed_by: string | null
          reviewed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          developer_id: number
          from_level: number
          to_level: number
          category: string
          criterion_key: string
          is_met?: boolean
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          developer_id?: number
          from_level?: number
          to_level?: number
          category?: string
          criterion_key?: string
          is_met?: boolean
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      promotion_requests: {
        Row: {
          id: number
          developer_id: number
          from_level: number
          to_level: number
          requested_salary: number | null
          status: string
          requested_by: string
          requested_at: string
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          developer_id: number
          from_level: number
          to_level: number
          requested_salary?: number | null
          status?: string
          requested_by: string
          requested_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          developer_id?: number
          from_level?: number
          to_level?: number
          requested_salary?: number | null
          status?: string
          requested_by?: string
          requested_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
