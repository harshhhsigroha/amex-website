/**
 * UK Financial Calendar utilities for folder structure
 * Financial Year: 6 April - 5 April
 * Week 1 starts on the Monday of the week containing 6 April
 */

import { format, startOfWeek, endOfWeek, addDays, eachDayOfInterval, getDay } from 'date-fns';

export interface FinancialYearInfo {
  label: string; // e.g., "FY 2024-25"
  startDate: Date;
  endDate: Date;
  startYear: number;
  endYear: number;
}

export interface FinancialWeekInfo {
  weekNumber: number;
  label: string; // e.g., "Week 1 (01 Apr 2024 - 07 Apr 2024)"
  startDate: Date;
  endDate: Date;
}

export interface FinancialDayInfo {
  date: Date;
  label: string; // e.g., "Saturday - 06 Apr 2024"
  dayOfWeek: string;
  isWithinFY: boolean;
}

export interface FinancialMonthInfo {
  month: number; // 0-11
  year: number;
  label: string; // e.g., "April 2024"
}

/**
 * Get the financial year for a given date
 */
export function getFinancialYearForDate(date: Date): FinancialYearInfo {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Financial year starts on April 6th
  // If before April 6th, it's in the previous financial year
  let startYear: number;
  if (month < 3 || (month === 3 && day < 6)) {
    startYear = year - 1;
  } else {
    startYear = year;
  }

  const endYear = startYear + 1;
  const startDate = new Date(startYear, 3, 6); // April 6th
  const endDate = new Date(endYear, 3, 5); // April 5th next year

  return {
    label: `FY ${startYear}-${String(endYear).slice(-2)}`,
    startDate,
    endDate,
    startYear,
    endYear,
  };
}

/**
 * Get all financial years available (recent years)
 */
export function getAvailableFinancialYears(yearsBack: number = 5): FinancialYearInfo[] {
  const now = new Date();
  const currentFY = getFinancialYearForDate(now);
  const years: FinancialYearInfo[] = [];

  for (let i = 0; i <= yearsBack; i++) {
    const targetDate = new Date(currentFY.startYear - i, 6, 1); // July of each year (safely in FY)
    years.push(getFinancialYearForDate(targetDate));
  }

  return years;
}

/**
 * Get the Monday of the week containing April 6th for a given financial year
 */
function getWeek1Monday(fyStartYear: number): Date {
  const april6 = new Date(fyStartYear, 3, 6);
  // startOfWeek with Monday as first day
  return startOfWeek(april6, { weekStartsOn: 1 });
}

/**
 * Calculate the financial week number for a given date
 */
export function getFinancialWeekNumber(date: Date): number {
  const fy = getFinancialYearForDate(date);
  const week1Monday = getWeek1Monday(fy.startYear);
  
  const daysSinceWeek1 = Math.floor(
    (date.getTime() - week1Monday.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return Math.floor(daysSinceWeek1 / 7) + 1;
}

/**
 * Get all financial weeks for a given financial year
 */
export function getFinancialWeeksForYear(fy: FinancialYearInfo): FinancialWeekInfo[] {
  const weeks: FinancialWeekInfo[] = [];
  const week1Monday = getWeek1Monday(fy.startYear);
  
  let currentWeekStart = week1Monday;
  let weekNumber = 1;

  while (currentWeekStart <= fy.endDate && weekNumber <= 53) {
    const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    
    weeks.push({
      weekNumber,
      label: `Week ${weekNumber} (${format(currentWeekStart, 'dd MMM yyyy')} - ${format(currentWeekEnd, 'dd MMM yyyy')})`,
      startDate: currentWeekStart,
      endDate: currentWeekEnd,
    });

    currentWeekStart = addDays(currentWeekStart, 7);
    weekNumber++;
  }

  return weeks;
}

/**
 * Get all months within a financial year
 */
export function getMonthsForFinancialYear(fy: FinancialYearInfo): FinancialMonthInfo[] {
  const months: FinancialMonthInfo[] = [];
  
  // April to December of start year
  for (let month = 3; month <= 11; month++) {
    months.push({
      month,
      year: fy.startYear,
      label: format(new Date(fy.startYear, month, 1), 'MMMM yyyy'),
    });
  }
  
  // January to April of end year
  for (let month = 0; month <= 3; month++) {
    months.push({
      month,
      year: fy.endYear,
      label: format(new Date(fy.endYear, month, 1), 'MMMM yyyy'),
    });
  }

  return months;
}

/**
 * Get all days within a financial week
 */
export function getDaysForWeek(week: FinancialWeekInfo, fy: FinancialYearInfo): FinancialDayInfo[] {
  const days = eachDayOfInterval({ start: week.startDate, end: week.endDate });
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return days.map(date => {
    const dayOfWeek = dayNames[getDay(date)];
    const isWithinFY = date >= fy.startDate && date <= fy.endDate;

    return {
      date,
      label: `${dayOfWeek} - ${format(date, 'dd MMM yyyy')}`,
      dayOfWeek,
      isWithinFY,
    };
  });
}

/**
 * Get financial weeks for a specific month
 */
export function getWeeksForMonth(month: FinancialMonthInfo, fy: FinancialYearInfo): FinancialWeekInfo[] {
  const allWeeks = getFinancialWeeksForYear(fy);
  const monthStart = new Date(month.year, month.month, 1);
  const monthEnd = new Date(month.year, month.month + 1, 0);

  return allWeeks.filter(week => {
    // Check if week overlaps with month
    return week.startDate <= monthEnd && week.endDate >= monthStart;
  });
}

/**
 * Format a date for display in file browser
 */
export function formatFileDate(date: Date): string {
  return format(date, 'dd MMM yyyy');
}

/**
 * Get breadcrumb path for a date
 */
export function getBreadcrumbPath(date: Date): {
  fy: FinancialYearInfo;
  month: FinancialMonthInfo;
  week: FinancialWeekInfo;
  day: FinancialDayInfo;
} {
  const fy = getFinancialYearForDate(date);
  const weekNumber = getFinancialWeekNumber(date);
  const weeks = getFinancialWeeksForYear(fy);
  const week = weeks.find(w => w.weekNumber === weekNumber) || weeks[0];
  const days = getDaysForWeek(week, fy);
  const day = days.find(d => d.date.toDateString() === date.toDateString()) || days[0];

  return {
    fy,
    month: {
      month: date.getMonth(),
      year: date.getFullYear(),
      label: format(date, 'MMMM yyyy'),
    },
    week,
    day,
  };
}

/**
 * Generate storage path for a file
 */
export function generateStoragePath(
  clientId: string,
  date: Date,
  fileName: string
): string {
  const fy = getFinancialYearForDate(date);
  const weekNumber = getFinancialWeekNumber(date);
  const dateStr = format(date, 'yyyy-MM-dd');
  
  return `${clientId}/${fy.label.replace(/\s/g, '_')}/${format(date, 'MMMM_yyyy')}/Week_${weekNumber}/${dateStr}/${fileName}`;
}
