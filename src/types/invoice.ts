export interface ClientDetails {
  companyName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface InvoiceConfig {
  vatNumber: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  remittanceEmail: string;
}

export interface InvoiceBranding {
  companyName: string;
  tagline: string;
  primaryColor: [number, number, number]; // RGB
}

export const DEFAULT_CONFIG: InvoiceConfig = {
  vatNumber: 'GB 123456789',
  bankName: 'PayCore by FirmFlow',
  sortCode: '04-06-05',
  accountNumber: '2197155',
  remittanceEmail: 'accounts@firmflow.com',
};

export const DEFAULT_BRANDING: InvoiceBranding = {
  companyName: 'PayCore by FirmFlow',
  tagline: 'Professional Payroll Services',
  primaryColor: [59, 130, 246], // Blue
};

// Legacy export for backwards compatibility
export const PAYCORE_CONFIG = DEFAULT_CONFIG;