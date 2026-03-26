export interface Candidate {
  id: string;
  emp_id: string;
  candidate_name: string;
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
  internal_name: string | null;
  has_candidate_id: boolean | null;
  application: boolean | null;
  proof_of_address: boolean | null;
  right_to_work: boolean | null;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateSnapshot {
  emp_id: string;
  candidate_name: string;
  address: string;
  agency?: string;
  beneficiary_name: string;
  account_number: string;
  sort_code: string;
  bank_name?: string;
}

export interface SelfBillLineItem {
  start_date: string;
  end_date: string;
  hours: number;
  rate: number;
  line_total: number;
}

export interface SelfBilledInvoice {
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

export interface CandidateValidationResult {
  valid: boolean;
  candidate?: Candidate;
  missingFields: string[];
}

export interface SelfBillGenerationResult {
  successful: SelfBilledInvoice[];
  exceptions: SelfBillException[];
}

export interface SelfBillException {
  emp_id: string;
  candidate_name?: string;
  reason: string;
  type: 'missing_candidate' | 'missing_payment_details' | 'other';
}

// Self-billing fixed address
export const SELF_BILL_TO_ADDRESS = {
  companyName: 'PayCore by FirmFlow',
  addressLine1: 'Suite 8 Pemberton House',
  addressLine2: 'Stafford Park 1',
  city: 'Telford',
  postcode: 'TF3 3BD',
} as const;

// Required fields for payment (NOT required to save candidate)
export const REQUIRED_PAYMENT_FIELDS = [
  'beneficiary_name',
  'account_number', 
  'sort_code',
] as const;
