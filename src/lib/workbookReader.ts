import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

export type SheetRow = Record<string, unknown>;

function normaliseHeaders(rows: unknown[][]): SheetRow[] {
  if (rows.length === 0) return [];
  const headerRowIndex = rows.findIndex(r => r.some(c => String(c ?? '').trim() !== ''));
  if (headerRowIndex === -1) return [];

  const headers = (rows[headerRowIndex] || []).map(h => String(h ?? '').trim());
  const out: SheetRow[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    if (!row.some(c => String(c ?? '').trim() !== '')) continue;
    const obj: SheetRow = {};
    headers.forEach((h, idx) => {
      if (!h) return;
      const value = row[idx];
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

async function readWithSheetJs(buffer: ArrayBuffer): Promise<SheetRow[]> {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: '',
    blankrows: false,
  });
  return normaliseHeaders(rows);
}

async function readWithExcelJs(buffer: ArrayBuffer, isCsv: boolean): Promise<SheetRow[]> {
  const workbook = new ExcelJS.Workbook();
  if (isCsv) {
    const text = new TextDecoder().decode(buffer);
    const rows = text
      .split(/\r?\n/)
      .filter(line => line.trim() !== '')
      .map(line => line.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
    return normaliseHeaders(rows);
  }

  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const rows: unknown[][] = [];
  worksheet.eachRow({ includeEmpty: false }, row => {
    const values: unknown[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      values[colNumber - 1] = cellToPrimitive(cell.value);
    });
    rows.push(values);
  });

  return normaliseHeaders(rows);
}

/**
 * Reads the first worksheet of an uploaded spreadsheet into row objects keyed by header.
 * Tries the tolerant SheetJS engine first (handles .xls, .csv and odd .xlsx variants),
 * falling back to ExcelJS if that fails.
 */
export async function readSpreadsheetRows(file: File): Promise<SheetRow[]> {
  const buffer = await file.arrayBuffer();
  const isCsv = /\.csv$/i.test(file.name);

  let primaryError: unknown = null;
  try {
    const rows = await readWithSheetJs(buffer);
    if (rows.length > 0) return rows;
  } catch (err) {
    primaryError = err;
  }

  try {
    return await readWithExcelJs(buffer, isCsv);
  } catch (err) {
    throw new Error(
      `Unable to read this spreadsheet. ${
        (primaryError instanceof Error ? primaryError.message : '') ||
        (err instanceof Error ? err.message : 'Unknown error')
      }`
    );
  }
}
