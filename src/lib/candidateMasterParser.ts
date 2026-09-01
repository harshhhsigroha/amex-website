import { readSpreadsheetRows } from '@/lib/workbookReader';
import { Candidate } from '@/types/candidate';

export interface CandidateMasterParseResult {
  success: boolean;
  data?: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>[];
  error?: string;
  warnings?: string[];
}

// Column mapping configuration - mapped by HEADER NAME (not position)
const COLUMN_MAPPINGS: Record<string, string[]> = {
  candidate_name: ['CANDIDATE NAME', 'NAME', 'FULL NAME', 'CANDIDATE_NAME'],
  account_number: ['ACCOUNT NUMBER', 'ACCOUNT NO.', 'ACCOUNT NO', 'ACC NO', 'ACCOUNT_NO', 'ACCOUNT_NUMBER'],
  sort_code: ['SORT CODE', 'SORT_CODE', 'SORTCODE'],
  beneficiary_name: ['BENEFICIARY NAME', 'BANK ACCOUNT', 'ACCOUNT NAME', 'BENEFICIARY', 'BANK ACCOUNT NAME'],
  emp_id: ['ID', 'EMP ID', 'EMPLOYEE ID', 'EMP_ID'],
  internal_name: ['INTERNAL NAME', 'INTERNAL_NAME'],
  address: ['ADDRESS', 'FULL ADDRESS', 'HOME ADDRESS'],
  agency: ['AGENCY', 'UMBRELLA', 'UMBRELLA COMPANY', 'AGENCY NAME'],
  bank_name: ['BANK NAME', 'BANK', 'BANK_NAME'],
  ni_number: ['NI NUMBER', 'NI NO', 'NI', 'NATIONAL INSURANCE', 'NI_NUMBER'],
  gender: ['GENDER', 'SEX'],
  dob: ['DOB', 'DATE OF BIRTH', 'BIRTH DATE', 'BIRTHDATE'],
  contact_no: ['CONTACT NO', 'PHONE', 'MOBILE', 'TELEPHONE', 'CONTACT NUMBER', 'CONTACT_NO'],
  email: ['EMAIL', 'EMAIL ADDRESS', 'E-MAIL'],
  has_candidate_id: ['HAS CANDIDATE ID', 'HAS_CANDIDATE_ID', 'CANDIDATE ID'],
  application: ['APPLICATION', 'APPLICATION STATUS'],
  proof_of_address: ['PROOF OF ADDRESS', 'PROOF_OF_ADDRESS', 'POA'],
  right_to_work: ['RIGHT TO WORK', 'RIGHT_TO_WORK', 'RTW'],
};

const TEXT_FIELDS = ['account_number', 'sort_code', 'ni_number', 'contact_no'];

function findColumnValue(row: Record<string, unknown>, fieldName: string): string | null {
  const possibleNames = COLUMN_MAPPINGS[fieldName] || [];
  
  for (const colName of possibleNames) {
    const key = Object.keys(row).find(
      k => k.toUpperCase().trim() === colName.toUpperCase()
    );
    if (key && row[key] !== undefined && row[key] !== null && row[key] !== '') {
      const value = row[key];
      if (TEXT_FIELDS.includes(fieldName)) {
        return String(value).trim();
      }
      return String(value).trim();
    }
  }
  
  return null;
}

function findBooleanValue(row: Record<string, unknown>, fieldName: string): boolean | null {
  const possibleNames = COLUMN_MAPPINGS[fieldName] || [];
  
  for (const colName of possibleNames) {
    const key = Object.keys(row).find(
      k => k.toUpperCase().trim() === colName.toUpperCase()
    );
    if (key && row[key] !== undefined && row[key] !== null && row[key] !== '') {
      const value = String(row[key]).trim().toLowerCase();
      if (value === 'yes' || value === 'true' || value === '1' || value === 'y') return true;
      if (value === 'no' || value === 'false' || value === '0' || value === 'n') return false;
    }
  }
  
  return null;
}

export async function parseCandidateMasterFile(file: File): Promise<CandidateMasterParseResult> {
  try {
    let jsonData: Record<string, unknown>[];
    try {
      jsonData = await readSpreadsheetRows(file);
    } catch (readErr) {
      return {
        success: false,
        error: readErr instanceof Error ? readErr.message : 'Failed to read the uploaded file.',
      };
    }

    if (jsonData.length === 0) {
      return { success: false, error: 'The uploaded file contains no data.' };
    }
    
    const headers = Object.keys(jsonData[0]).map(h => h.toUpperCase().trim());
    const warnings: string[] = [];
    
    const hasCandidateName = COLUMN_MAPPINGS.candidate_name.some(col =>
      headers.includes(col.toUpperCase())
    );
    
    if (!hasCandidateName) {
      return {
        success: false,
        error: 'Missing required column: CANDIDATE NAME (or NAME). This column is mandatory.',
      };
    }
    
    const candidates: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>[] = [];
    const seenKeys = new Set<string>();
    
    jsonData.forEach((row, index) => {
      const candidateName = findColumnValue(row, 'candidate_name');
      const accountNumber = findColumnValue(row, 'account_number');
      
      if (!candidateName) {
        warnings.push(`Row ${index + 2}: Missing candidate name, skipped`);
        return;
      }
      
      const matchKey = `${candidateName.toLowerCase()}|${(accountNumber || '').toLowerCase()}`;
      
      if (seenKeys.has(matchKey)) {
        warnings.push(`Row ${index + 2}: Duplicate candidate "${candidateName}" with same account, skipped`);
        return;
      }
      
      seenKeys.add(matchKey);
      
      const rawEmpId = findColumnValue(row, 'emp_id');
      const isBooleanValue = rawEmpId && ['yes', 'no', 'true', 'false', 'y', 'n', '1', '0'].includes(rawEmpId.toLowerCase());
      const empId = (rawEmpId && !isBooleanValue) ? rawEmpId :
        candidateName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) + 
        String(index + 1).padStart(3, '0');

      candidates.push({
        emp_id: empId,
        candidate_name: candidateName,
        client_id: null,
        address: findColumnValue(row, 'address'),
        agency: findColumnValue(row, 'agency'),
        beneficiary_name: findColumnValue(row, 'beneficiary_name'),
        account_number: accountNumber,
        sort_code: findColumnValue(row, 'sort_code'),
        bank_name: findColumnValue(row, 'bank_name'),
        ni_number: findColumnValue(row, 'ni_number'),
        gender: findColumnValue(row, 'gender'),
        dob: findColumnValue(row, 'dob'),
        contact_no: findColumnValue(row, 'contact_no'),
        email: findColumnValue(row, 'email'),
        internal_name: findColumnValue(row, 'internal_name'),
        has_candidate_id: findBooleanValue(row, 'has_candidate_id'),
        application: findBooleanValue(row, 'application'),
        proof_of_address: findBooleanValue(row, 'proof_of_address'),
        right_to_work: findBooleanValue(row, 'right_to_work'),
        hourly_rate: null,
      });
    });
    
    if (candidates.length === 0) {
      return { success: false, error: 'No valid candidates found in the file.', warnings };
    }
    
    return {
      success: true,
      data: candidates,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse Candidate Master file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export function validateCandidatePaymentDetails(candidate: Candidate): {
  valid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  
  if (!candidate.beneficiary_name) missingFields.push('Beneficiary Name');
  if (!candidate.account_number) missingFields.push('Account Number');
  if (!candidate.sort_code) missingFields.push('Sort Code');
  
  return { valid: missingFields.length === 0, missingFields };
}
