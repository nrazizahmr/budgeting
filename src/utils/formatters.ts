import { AlertLevel } from '../types/budget';

/**
 * Format number to Indonesian Rupiah currency format
 * e.g. 3000000 -> "Rp3.000.000"
 */
export function formatIDR(amount: number, showSign: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp0';
  }
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(absVal);

  if (isNegative) {
    return `-Rp${formatted}`;
  }
  if (showSign && amount > 0) {
    return `+Rp${formatted}`;
  }
  return `Rp${formatted}`;
}

/**
 * Sanitize plain text to prevent script injection / HTML markup
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 250);
}

/**
 * Format date for display in Indonesian format
 * e.g. "14 Oktober 2026, 14:30"
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Determine alert level and styling based on usage percentage
 * Business Rules:
 * Warning (kuning): 80% s/d 99%
 * Critical (merah): 100%
 * Overbudget (Hitam): > 100%
 */
export function getAlertLevel(percentage: number): AlertLevel {
  if (percentage > 100) return 'overbudget';
  if (percentage === 100) return 'critical';
  if (percentage >= 80) return 'warning';
  return 'normal';
}

export function getAlertBadgeStyle(level: AlertLevel): {
  bg: string;
  text: string;
  border: string;
  barColor: string;
  label: string;
} {
  switch (level) {
    case 'overbudget':
      return {
        bg: 'bg-neutral-900',
        text: 'text-white',
        border: 'border-neutral-900',
        barColor: 'bg-neutral-950', // Hitam
        label: 'Overbudget',
      };
    case 'critical':
      return {
        bg: 'bg-rose-100',
        text: 'text-rose-700',
        border: 'border-rose-300',
        barColor: 'bg-rose-500', // Merah
        label: 'Batas Kritis (100%)',
      };
    case 'warning':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
        barColor: 'bg-amber-400', // Kuning
        label: 'Waspada (80%+)',
      };
    case 'normal':
    default:
      return {
        bg: 'bg-stone-100',
        text: 'text-stone-700',
        border: 'border-stone-200',
        barColor: 'bg-emerald-500',
        label: 'Aman',
      };
  }
}

/**
 * Calculate burn rate and remaining cycle days
 */
export function calculateBurnRate(
  totalSpent: number,
  totalBudget: number,
  periodMonth: number = 9, // 0-indexed: 9 = October
  periodYear: number = 2026,
  salaryCycle: '1-end' | '25-24' = '1-end'
) {
  const now = new Date('2026-10-14T12:00:00'); // pinned to reference time
  const currentDay = now.getDate(); // 14
  
  let daysInCycle = 31;
  let elapsedDays = currentDay;
  let remainingDays = daysInCycle - elapsedDays;

  if (salaryCycle === '25-24') {
    // 25th of month to 24th of next
    daysInCycle = 30;
    if (currentDay >= 25) {
      elapsedDays = currentDay - 25 + 1;
    } else {
      elapsedDays = (30 - 25 + 1) + currentDay;
    }
    remainingDays = Math.max(1, daysInCycle - elapsedDays);
  } else {
    // 1st to end of month
    daysInCycle = 31; // October has 31 days
    elapsedDays = Math.max(1, currentDay);
    remainingDays = Math.max(0, daysInCycle - elapsedDays);
  }

  const dailyBurnRate = Math.round(totalSpent / Math.max(1, elapsedDays));
  const remainingBudget = totalBudget - totalSpent;
  const recommendedDaily = remainingDays > 0 ? Math.max(0, Math.round(remainingBudget / remainingDays)) : 0;
  const projectedTotal = dailyBurnRate * daysInCycle;
  const isPaceOverbudget = projectedTotal > totalBudget && totalBudget > 0;

  return {
    daysInCycle,
    elapsedDays,
    remainingDays,
    dailyBurnRate,
    remainingBudget,
    recommendedDaily,
    projectedTotal,
    isPaceOverbudget,
  };
}

export interface MonthInfo {
  value: string; // standard English e.g. 'October'
  labelId: string; // Indonesian e.g. 'Oktober'
  labelEn: string;
  monthNum: number; // 1-12
}

export const MONTH_LIST: MonthInfo[] = [
  { value: 'January', labelId: 'Januari', labelEn: 'January', monthNum: 1 },
  { value: 'February', labelId: 'Februari', labelEn: 'February', monthNum: 2 },
  { value: 'March', labelId: 'Maret', labelEn: 'March', monthNum: 3 },
  { value: 'April', labelId: 'April', labelEn: 'April', monthNum: 4 },
  { value: 'May', labelId: 'Mei', labelEn: 'May', monthNum: 5 },
  { value: 'June', labelId: 'Juni', labelEn: 'June', monthNum: 6 },
  { value: 'July', labelId: 'Juli', labelEn: 'July', monthNum: 7 },
  { value: 'August', labelId: 'Agustus', labelEn: 'August', monthNum: 8 },
  { value: 'September', labelId: 'September', labelEn: 'September', monthNum: 9 },
  { value: 'October', labelId: 'Oktober', labelEn: 'October', monthNum: 10 },
  { value: 'November', labelId: 'November', labelEn: 'November', monthNum: 11 },
  { value: 'December', labelId: 'Desember', labelEn: 'December', monthNum: 12 },
];

const MONTH_ALIAS_MAP: Record<string, string> = {
  january: 'January',
  januari: 'January',
  jan: 'January',
  february: 'February',
  februari: 'February',
  feb: 'February',
  march: 'March',
  maret: 'March',
  mar: 'March',
  april: 'April',
  apr: 'April',
  may: 'May',
  mei: 'May',
  june: 'June',
  juni: 'June',
  jun: 'June',
  july: 'July',
  juli: 'July',
  jul: 'July',
  august: 'August',
  agustus: 'August',
  aug: 'August',
  agu: 'August',
  september: 'September',
  sep: 'September',
  october: 'October',
  oktober: 'October',
  oct: 'October',
  okt: 'October',
  november: 'November',
  nov: 'November',
  december: 'December',
  desember: 'December',
  dec: 'December',
  des: 'December',
};

/**
 * Parse a period string (e.g. "October 2026", "Oktober 2026", "2026-10")
 * into normalized components
 */
export function parsePeriod(periodStr: string): {
  month: string; // e.g. "October"
  monthLabelId: string; // e.g. "Oktober"
  year: number; // e.g. 2026
  monthIndex: number; // 0-11
  isoPrefix: string; // "2026-10"
  formattedDisplay: string; // "Oktober 2026"
} {
  const clean = (periodStr || '').trim();
  let month = 'October';
  let year = 2026;

  // Pattern "YYYY-MM"
  if (/^\d{4}-\d{2}$/.test(clean)) {
    const [y, m] = clean.split('-');
    year = parseInt(y, 10);
    const mNum = parseInt(m, 10);
    const found = MONTH_LIST.find((item) => item.monthNum === mNum);
    if (found) month = found.value;
  } else {
    // Pattern "Month Year" or "Year Month"
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      const yearPart = parts.find((p) => /^\d{4}$/.test(p));
      const monthPart = parts.find((p) => !/^\d{4}$/.test(p))?.toLowerCase();
      if (yearPart) year = parseInt(yearPart, 10);
      if (monthPart && MONTH_ALIAS_MAP[monthPart]) {
        month = MONTH_ALIAS_MAP[monthPart];
      }
    }
  }

  const foundItem = MONTH_LIST.find((m) => m.value.toLowerCase() === month.toLowerCase()) || MONTH_LIST[9];
  const monthNumStr = String(foundItem.monthNum).padStart(2, '0');

  return {
    month: foundItem.value,
    monthLabelId: foundItem.labelId,
    year,
    monthIndex: foundItem.monthNum - 1,
    isoPrefix: `${year}-${monthNumStr}`,
    formattedDisplay: `${foundItem.labelId} ${year}`,
  };
}

/**
 * Get period shifted by delta months (e.g. +1 for next month, -1 for previous)
 */
export function getAdjacentPeriod(currentPeriod: string, deltaMonths: number): string {
  const { monthIndex, year } = parsePeriod(currentPeriod);
  const totalMonths = year * 12 + monthIndex + deltaMonths;
  const newYear = Math.floor(totalMonths / 12);
  const newMonthIndex = ((totalMonths % 12) + 12) % 12;
  const targetMonth = MONTH_LIST[newMonthIndex].value;
  return `${targetMonth} ${newYear}`;
}
