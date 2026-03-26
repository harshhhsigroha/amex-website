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
  bankName: 'AMEX Outsourcing',
  sortCode: '04-06-05',
  accountNumber: '2197155',
  remittanceEmail: 'accounts@amexoutsourcing.com',
};

export const DEFAULT_BRANDING: InvoiceBranding = {
  companyName: 'AMEX Outsourcing',
  tagline: 'Professional Payroll Services',
  primaryColor: [220, 38, 38], // Red
};

// Legacy export for backwards compatibility
export const PAYCORE_CONFIG = DEFAULT_CONFIG;