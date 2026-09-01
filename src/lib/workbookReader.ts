import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

export type SheetRow = Record<string, unknown>;

function normaliseHeaders(rows: unknown[][]): SheetRow[] {
  if (!rows || rows.length === 0) return [];
  const headerRowIndex = rows.findIndex(
    r => Array.isArray(r) && r.filter(c => String(c ?? '').trim() !== '').length >= 2
  );
  const idx = headerRowIndex === -1
    ? rows.findIndex(r => Array.isArray(r) && r.some(c => String(c ?? '').trim() !== ''))
    : headerRowIndex;
  if (idx === -1) return [];

  const headers = (rows[idx] || []).map(h => String(h ?? '').trim());
  const out: SheetRow[] = [];

  for (let i = idx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    if (!row.some(c => String(c ?? '').trim() !== '')) continue;
    const obj: SheetRow = {};
    headers.forEach((h, colIdx) => {
      if (!h) return;
      const value = row[colIdx];
      obj[h] = value === undefined || value === null ? '' : value;
    });
    if (Object.keys(obj).length > 0) out.push(obj);
  }

  return out;
}

function cellToPrimitive(value: unknown): unknown {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if ('text' in v) return v.text;
    if ('result' in v) return v.result;
    if ('richText' in v && Array.isArray(v.richText)) {
      return (v.richText as { text?: string }[]).map(t => t.text ?? '').join('');
    }
    if ('hyperlink' in v && 'text' in v) return v.text;
  }
  return value;
}

function rowsFromSheetJsWorkbook(workbook: XLSX.WorkBook): SheetRow[] {
  for (const sheetName of workbook.SheetNames || []) {
    const sheet = workbook.Sheets?.[sheetName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: true,
      defval: '',
      blankrows: false,
    });
    const parsed = normaliseHeaders(rows);
    if (parsed.length > 0) return parsed;
  }
  return [];
}

function readWithSheetJsArray(buffer: ArrayBuffer): SheetRow[] {
  return rowsFromSheetJsWorkbook(XLSX.read(buffer, { type: 'array', cellDates: true }));
}

function readWithSheetJsBinary(buffer: ArrayBuffer): SheetRow[] {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return rowsFromSheetJsWorkbook(XLSX.read(binary, { type: 'binary', cellDates: true }));
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === ',' || ch === ';' || ch === '\t') && !inQuotes) {
      out.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  out.push(current.trim());
  return out;
}

function readAsDelimitedText(buffer: ArrayBuffer): SheetRow[] {
  const text = new TextDecoder().decode(buffer);
  const rows = text
    .split(/\r?\n/)
    .filter(line => line.trim() !== '')
    .map(splitCsvLine);
  return normaliseHeaders(rows);
}

async function readWithExcelJs(buffer: ArrayBuffer): Promise<SheetRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  for (const worksheet of workbook.worksheets || []) {
    const rows: unknown[][] = [];
    worksheet.eachRow({ includeEmpty: false }, row => {
      const values: unknown[] = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        values[colNumber - 1] = cellToPrimitive(cell.value);
      });
      rows.push(values);
    });
    const parsed = normaliseHeaders(rows);
    if (parsed.length > 0) return parsed;
  }
  return [];
}

/**
 * Reads an uploaded spreadsheet into row objects keyed by header.
 * Tries several engines in order so .xlsx, .xlsm, .xlsb, legacy .xls,
 * CSV and odd workbook variants all import successfully.
 */
export async function readSpreadsheetRows(file: File): Promise<SheetRow[]> {
  const buffer = await file.arrayBuffer();
  const isCsv = /\.(csv|txt|tsv)$/i.test(file.name);
  const errors: string[] = [];

  const strategies: Array<() => Promise<SheetRow[]> | SheetRow[]> = isCsv
    ? [() => readAsDelimitedText(buffer), () => readWithSheetJsArray(buffer)]
    : [
        () => readWithSheetJsArray(buffer),
        () => readWithSheetJsBinary(buffer),
        () => readWithExcelJs(buffer),
        () => readAsDelimitedText(buffer),
      ];

  for (const run of strategies) {
    try {
      const rows = await run();
      if (rows.length > 0) return rows;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  throw new Error(
    errors.length > 0
      ? `Unable to read this spreadsheet. Please re-save it as .xlsx or .csv and try again. (${errors[0]})`
      : 'Unable to read this spreadsheet: no data rows were found. Check the file has a header row and at least one row of data.'
  );
}
