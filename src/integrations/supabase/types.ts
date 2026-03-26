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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          can_generate_invoices: boolean
          can_generate_self_bills: boolean
          can_manage_candidates: boolean
          can_manage_clients: boolean
          can_view_dashboard: boolean
          can_view_history: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_generate_invoices?: boolean
          can_generate_self_bills?: boolean
          can_manage_candidates?: boolean
          can_manage_clients?: boolean
          can_view_dashboard?: boolean
          can_view_history?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_generate_invoices?: boolean
          can_generate_self_bills?: boolean
          can_manage_candidates?: boolean
          can_manage_clients?: boolean
          can_view_dashboard?: boolean
          can_view_history?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          message: string
          priority: string | null
          target_tier: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          priority?: string | null
          target_tier?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          priority?: string | null
          target_tier?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          account_number: string | null
          address: string | null
          agency: string | null
          application: boolean | null
          bank_name: string | null
          beneficiary_name: string | null
          candidate_name: string
          contact_no: string | null
          created_at: string
          dob: string | null
          email: string | null
          emp_id: string
          gender: string | null
          has_candidate_id: boolean | null
          hourly_rate: number | null
          id: string
          internal_name: string | null
          ni_number: string | null
          proof_of_address: boolean | null
          right_to_work: boolean | null
          sort_code: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          agency?: string | null
          application?: boolean | null
          bank_name?: string | null
          beneficiary_name?: string | null
          candidate_name: string
          contact_no?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          emp_id: string
          gender?: string | null
          has_candidate_id?: boolean | null
          hourly_rate?: number | null
          id?: string
          internal_name?: string | null
          ni_number?: string | null
          proof_of_address?: boolean | null
          right_to_work?: boolean | null
          sort_code?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          address?: string | null
          agency?: string | null
          application?: boolean | null
          bank_name?: string | null
          beneficiary_name?: string | null
          candidate_name?: string
          contact_no?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          emp_id?: string
          gender?: string | null
          has_candidate_id?: boolean | null
          hourly_rate?: number | null
          id?: string
          internal_name?: string | null
          ni_number?: string | null
          proof_of_address?: boolean | null
          right_to_work?: boolean | null
          sort_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_billing_records: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          paid_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          client_id: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_billing_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding_checklist: {
        Row: {
          client_id: string
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          notes: string | null
          step_key: string
          step_label: string
          updated_at: string
        }
        Insert: {
          client_id: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          step_key: string
          step_label: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          step_key?: string
          step_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_checklist_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_permissions: {
        Row: {
          can_generate_invoices: boolean
          can_generate_self_bills: boolean
          can_manage_candidates: boolean
          can_view_dashboard: boolean
          can_view_history: boolean
          client_id: string
          created_at: string
          id: string
          require_timesheet_approval: boolean
          updated_at: string
        }
        Insert: {
          can_generate_invoices?: boolean
          can_generate_self_bills?: boolean
          can_manage_candidates?: boolean
          can_view_dashboard?: boolean
          can_view_history?: boolean
          client_id: string
          created_at?: string
          id?: string
          require_timesheet_approval?: boolean
          updated_at?: string
        }
        Update: {
          can_generate_invoices?: boolean
          can_generate_self_bills?: boolean
          can_manage_candidates?: boolean
          can_view_dashboard?: boolean
          can_view_history?: boolean
          client_id?: string
          created_at?: string
          id?: string
          require_timesheet_approval?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_permissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_plans: {
        Row: {
          billing_cycle: string
          client_id: string
          created_at: string
          id: string
          monthly_fee: number
          next_billing_at: string | null
          notes: string | null
          plan_name: string
          plan_tier: string
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          client_id: string
          created_at?: string
          id?: string
          monthly_fee?: number
          next_billing_at?: string | null
          notes?: string | null
          plan_name?: string
          plan_tier?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          client_id?: string
          created_at?: string
          id?: string
          monthly_fee?: number
          next_billing_at?: string | null
          notes?: string | null
          plan_name?: string
          plan_tier?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_white_label: {
        Row: {
          brand_name: string | null
          client_id: string
          created_at: string
          custom_domain: string | null
          enabled: boolean
          hide_powered_by: boolean
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          brand_name?: string | null
          client_id: string
          created_at?: string
          custom_domain?: string | null
          enabled?: boolean
          hide_powered_by?: boolean
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          brand_name?: string | null
          client_id?: string
          created_at?: string
          custom_domain?: string | null
          enabled?: boolean
          hide_powered_by?: boolean
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_white_label_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          company_name: string
          country: string
          created_at: string
          id: string
          parent_client_id: string | null
          postcode: string
          updated_at: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          company_name: string
          country: string
          created_at?: string
          id?: string
          parent_client_id?: string | null
          postcode: string
          updated_at?: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          company_name?: string
          country?: string
          created_at?: string
          id?: string
          parent_client_id?: string | null
          postcode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          file_date: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string | null
          financial_week: number
          financial_year: string
          id: string
          mime_type: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          file_date: string
          file_name: string
          file_path: string
          file_size?: number
          file_type?: string | null
          financial_week: number
          financial_year: string
          id?: string
          mime_type?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          file_date?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string | null
          financial_week?: number
          financial_year?: string
          id?: string
          mime_type?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          emp_id: string
          end_date: string
          firstname: string
          hours: number
          id: string
          invoice_id: string
          pay_amount: number
          pay_date: string | null
          pay_rate: number
          start_date: string
          surname: string
          timesheet_id: string | null
          total: number
          umbrella_company: string | null
          vat: number
        }
        Insert: {
          created_at?: string
          emp_id: string
          end_date: string
          firstname: string
          hours: number
          id?: string
          invoice_id: string
          pay_amount: number
          pay_date?: string | null
          pay_rate: number
          start_date: string
          surname: string
          timesheet_id?: string | null
          total: number
          umbrella_company?: string | null
          vat: number
        }
        Update: {
          created_at?: string
          emp_id?: string
          end_date?: string
          firstname?: string
          hours?: number
          id?: string
          invoice_id?: string
          pay_amount?: number
          pay_date?: string | null
          pay_rate?: number
          start_date?: string
          surname?: string
          timesheet_id?: string | null
          total?: number
          umbrella_company?: string | null
          vat?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_settings: {
        Row: {
          account_number: string
          bank_name: string
          created_at: string
          id: string
          remittance_email: string
          self_bill_address_line1: string
          self_bill_address_line2: string
          self_bill_city: string
          self_bill_company_name: string
          self_bill_postcode: string
          sort_code: string
          updated_at: string
          vat_number: string
        }
        Insert: {
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          remittance_email?: string
          self_bill_address_line1?: string
          self_bill_address_line2?: string
          self_bill_city?: string
          self_bill_company_name?: string
          self_bill_postcode?: string
          sort_code?: string
          updated_at?: string
          vat_number?: string
        }
        Update: {
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          remittance_email?: string
          self_bill_address_line1?: string
          self_bill_address_line2?: string
          self_bill_city?: string
          self_bill_company_name?: string
          self_bill_postcode?: string
          sort_code?: string
          updated_at?: string
          vat_number?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_id: string
          client_snapshot: Json
          created_at: string
          financial_week: number
          financial_year: string
          grand_total: number
          id: string
          invoice_date: string
          invoice_number: string
          pdf_filename: string
          period_end: string
          period_start: string
          total_contractors: number
          total_gross: number
          total_vat: number
        }
        Insert: {
          client_id: string
          client_snapshot: Json
          created_at?: string
          financial_week: number
          financial_year: string
          grand_total: number
          id?: string
          invoice_date: string
          invoice_number: string
          pdf_filename: string
          period_end: string
          period_start: string
          total_contractors: number
          total_gross: number
          total_vat: number
        }
        Update: {
          client_id?: string
          client_snapshot?: Json
          created_at?: string
          financial_week?: number
          financial_year?: string
          grand_total?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          pdf_filename?: string
          period_end?: string
          period_start?: string
          total_contractors?: number
          total_gross?: number
          total_vat?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_form_config: {
        Row: {
          client_id: string | null
          created_at: string
          fields: Json
          form_name: string
          form_type: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          fields?: Json
          form_name?: string
          form_type?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          fields?: Json
          form_name?: string
          form_type?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_form_config_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          sub_client_id: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          sub_client_id?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          sub_client_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_users_sub_client_id_fkey"
            columns: ["sub_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      self_billed_invoices: {
        Row: {
          candidate_snapshot: Json
          client_id: string | null
          created_at: string
          deductions: number
          emp_id: string
          financial_week: number
          financial_year: string
          id: string
          line_items: Json
          net_total: number
          payment_date: string
          pdf_filename: string
          remittance_number: string
          total_to_pay: number
        }
        Insert: {
          candidate_snapshot: Json
          client_id?: string | null
          created_at?: string
          deductions?: number
          emp_id: string
          financial_week: number
          financial_year: string
          id?: string
          line_items: Json
          net_total: number
          payment_date: string
          pdf_filename: string
          remittance_number: string
          total_to_pay: number
        }
        Update: {
          candidate_snapshot?: Json
          client_id?: string | null
          created_at?: string
          deductions?: number
          emp_id?: string
          financial_week?: number
          financial_year?: string
          id?: string
          line_items?: Json
          net_total?: number
          payment_date?: string
          pdf_filename?: string
          remittance_number?: string
          total_to_pay?: number
        }
        Relationships: [
          {
            foreignKeyName: "self_billed_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          is_read: boolean
          message: string
          sender_id: string
          ticket_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          is_read?: boolean
          message: string
          sender_id: string
          ticket_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          is_read?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          description: string
          first_response_at: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          sla_target_hours: number | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          description: string
          first_response_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          sla_target_hours?: number | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          description?: string
          first_response_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          sla_target_hours?: number | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      time_logs: {
        Row: {
          candidate_id: string
          candidate_name: string
          client_id: string
          clock_in: string
          clock_in_address: string | null
          clock_in_lat: number | null
          clock_in_lng: number | null
          clock_out: string | null
          clock_out_address: string | null
          clock_out_lat: number | null
          clock_out_lng: number | null
          created_at: string
          emp_id: string
          financial_week: number
          financial_year: string
          id: string
          log_date: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          candidate_name: string
          client_id: string
          clock_in?: string
          clock_in_address?: string | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out?: string | null
          clock_out_address?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          created_at?: string
          emp_id: string
          financial_week: number
          financial_year: string
          id?: string
          log_date?: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          candidate_name?: string
          client_id?: string
          clock_in?: string
          clock_in_address?: string | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out?: string | null
          clock_out_address?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          created_at?: string
          emp_id?: string
          financial_week?: number
          financial_year?: string
          id?: string
          log_date?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_logs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          candidate_id: string
          candidate_name: string
          client_id: string
          created_at: string
          emp_id: string
          financial_week: number
          financial_year: string
          hourly_rate: number
          id: string
          log_date: string | null
          status: string
          total_amount: number
          total_hours: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          candidate_id: string
          candidate_name: string
          client_id: string
          created_at?: string
          emp_id: string
          financial_week: number
          financial_year: string
          hourly_rate?: number
          id?: string
          log_date?: string | null
          status?: string
          total_amount?: number
          total_hours?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          candidate_id?: string
          candidate_name?: string
          client_id?: string
          created_at?: string
          emp_id?: string
          financial_week?: number
          financial_year?: string
          hourly_rate?: number
          id?: string
          log_date?: string | null
          status?: string
          total_amount?: number
          total_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      get_client_id: { Args: { _user_id: string }; Returns: string }
      get_portal_client_id: { Args: { _user_id: string }; Returns: string }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_client: { Args: { _user_id: string }; Returns: boolean }
      is_portal_user: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
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
      app_role: ["super_admin", "admin"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const
