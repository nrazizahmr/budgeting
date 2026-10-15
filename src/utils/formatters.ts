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
