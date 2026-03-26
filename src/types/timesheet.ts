export interface TimesheetEntry {
  empId: string;
  firstName: string;
  surname: string;
  timesheetId: string;
  hours: number;
  payRate: number;
  payAmount: number;
  vat: number;
  total: number;
  umbrellaCompany: string;
  startDate: string;
  endDate: string;
  payDate: string;
}

export interface MasterInvoice {
  invoiceType: string;
  umbrellaCompany: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  totalContractors: number;
  entries: TimesheetEntry[];
  totalGrossPay: number;
  totalVat: number;
  grandTotal: number;
}

export const REQUIRED_COLUMNS = [
  'EMP ID',
  'FIRSTNAME',
  'SURNAME',
  'TIMESHEET ID',
  'HOURS',
  'PAY RATE',
  'PAY AMOUNT',
  'VAT',
  'TOTAL',
  'UMBRELLA COMPANY',
  'START DATE',
  'END DATE',
  'PAY DATE',
] as const;
