export interface DbClient {
  id: string;
  company_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  postcode: string;
  country: string;
  parent_client_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbInvoice {
  id: string;
  client_id: string;
  invoice_number: string;
  invoice_date: string;
  financial_year: string;
  financial_week: number;
  period_start: string;
  period_end: string;
  total_gross: number;
  total_vat: number;
  grand_total: number;
  total_contractors: number;
  pdf_filename: string;
  client_snapshot: ClientSnapshot;
  created_at: string;
}

export interface ClientSnapshot {
  company_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface InvoiceWithClient extends DbInvoice {
  client?: DbClient;
}

export interface CandidateSnapshot {
  emp_id: string;
  candidate_name: string;
  beneficiary_name: string;
  address: string;
  sort_code: string;
  account_number: string;
}

export interface SelfBillLineItem {
  start_date: string;
  end_date: string;
  hours: number;
  rate: number;
  line_total: number;
}

export interface DbSelfBilledInvoice {
  id: string;
  emp_id: string;
  candidate_snapshot: CandidateSnapshot;
  remittance_number: string;
  payment_date: string;
  financial_year: string;
  financial_week: number;
  net_total: number;
  deductions: number;
  total_to_pay: number;
  line_items: SelfBillLineItem[];
  pdf_filename: string;
  created_at: string;
}

export interface DbCandidate {
  id: string;
  emp_id: string;
  candidate_name: string;
  internal_name: string | null;
  address: string | null;
  agency: string | null;
  beneficiary_name: string | null;
  account_number: string | null;
  sort_code: string | null;
  bank_name: string | null;
  ni_number: string | null;
  gender: string | null;
  dob: string | null;
  contact_no: string | null;
  email: string | null;
  has_candidate_id: boolean | null;
  application: boolean | null;
  proof_of_address: boolean | null;
  right_to_work: boolean | null;
  created_at: string;
  updated_at: string;
}
