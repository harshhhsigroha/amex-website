/**
 * UK Financial Year utilities
 * UK Financial Year: 6 April - 5 April
 */

export interface FinancialPeriod {
  financialYear: string; // e.g., "FY 2025-2026"
  financialWeek: number; // 1-53
  yearStart: Date;
  yearEnd: Date;
}

/**
 * Get the UK financial year start date for a given calendar year
 * Financial year starts on April 6th
 */
export function getFinancialYearStart(calendarYear: number): Date {
  return new Date(calendarYear, 3, 6); // April 6th (month is 0-indexed)
}

/**
 * Get the UK financial year end date for a given calendar year
 * Financial year ends on April 5th of the following year
 */
export function getFinancialYearEnd(calendarYear: number): Date {
  return new Date(calendarYear + 1, 3, 5); // April 5th next year
}

/**
 * Calculate UK financial week number and year for a given date
 * Week 1 starts on April 6th
 */
export function getUKFinancialPeriod(date: Date): FinancialPeriod {
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  // Determine which financial year the date falls into
  const year = inputDate.getFullYear();
  const month = inputDate.getMonth();
  const day = inputDate.getDate();

  // If before April 6th, it's in the previous financial year
  let fyStartYear: number;
  if (month < 3 || (month === 3 && day < 6)) {
    fyStartYear = year - 1;
  } else {
    fyStartYear = year;
  }

  const yearStart = getFinancialYearStart(fyStartYear);
  const yearEnd = getFinancialYearEnd(fyStartYear);

  // Calculate days since financial year start
  const daysSinceStart = Math.floor(
    (inputDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate financial week (1-indexed)
  const financialWeek = Math.floor(daysSinceStart / 7) + 1;

  // Validate week is within valid range (1-53)
  if (financialWeek < 1 || financialWeek > 53) {
    throw new Error(`Invalid financial week calculated: ${financialWeek}`);
  }

  const financialYear = `FY ${fyStartYear}-${fyStartYear + 1}`;

  return {
    financialYear,
    financialWeek,
    yearStart,
    yearEnd,
  };
}

/**
 * Format financial week as W01, W02, etc.
 */
export function formatFinancialWeek(week: number): string {
  return `W${String(week).padStart(2, '0')}`;
}

/**
 * Generate invoice filename following the naming convention:
 * ClientName_FYXXXX-WXX_InvoiceDate.pdf
 */
export function generateInvoiceFilename(
  clientName: string,
  invoiceDate: Date,
  extension: string = 'pdf'
): string {
  const { financialYear, financialWeek } = getUKFinancialPeriod(invoiceDate);
  
  // Clean client name (remove special characters, replace spaces with nothing)
  const cleanClientName = clientName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '');

  // Format: FY2025-W11
  const fyCode = financialYear.replace('FY ', 'FY').replace('-', '-');
  const weekCode = formatFinancialWeek(financialWeek);

  // Format date as DD-MM-YYYY
  const day = String(invoiceDate.getDate()).padStart(2, '0');
  const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');
  const year = invoiceDate.getFullYear();
  const dateStr = `${day}-${month}-${year}`;

  return `${cleanClientName}_${fyCode}-${weekCode}_${dateStr}.${extension}`;
}

/**
 * Validate that a date can have its financial period determined
 */
export function validateFinancialDate(date: Date): { valid: boolean; error?: string } {
  try {
    const period = getUKFinancialPeriod(date);
    if (period.financialWeek < 1 || period.financialWeek > 53) {
      return { valid: false, error: 'Financial week out of valid range (1-53)' };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: String(error) };
  }
}
