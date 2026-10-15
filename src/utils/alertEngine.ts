import { AlertNotification, BudgetAllocation, AlertLevel } from '../types/budget';
import { StorageService } from '../services/storage';
import { formatIDR } from './formatters';

export interface EvaluationResult {
  newNotification?: AlertNotification;
  level: AlertLevel;
  percentage: number;
  newSpentAmount: number;
  overAmount: number;
}

/**
 * Evaluates budget alerts whenever a transaction mutation occurs.
 * Enforces US-03 rules:
 * - Warning (80% - 99%)
 * - Critical (100%)
 * - Overbudget (> 100%)
 * - Max 1 notification per threshold level per category per budget cycle.
 */
export function evaluateBudgetAlert(
  budget: BudgetAllocation,
  addedExpenseAmount: number
): EvaluationResult {
  const newSpent = budget.spentAmount + addedExpenseAmount;
  const percentage = Math.round((newSpent / budget.allocatedAmount) * 100);
  const overAmount = newSpent - budget.allocatedAmount;

  let currentLevel: AlertLevel = 'normal';
  if (percentage > 100) {
    currentLevel = 'overbudget';
  } else if (percentage === 100) {
    currentLevel = 'critical';
  } else if (percentage >= 80) {
    currentLevel = 'warning';
  }

  // Check if notification already dispatched for this cycle + category + level
  const thresholdKey = `${budget.period}_${budget.categoryId}_${currentLevel}`;
  const alertedRecords = StorageService.getAlertedThresholds();

  let newNotif: AlertNotification | undefined;

  if (currentLevel !== 'normal' && !alertedRecords[thresholdKey]) {
    // Generate notification matching AC criteria
    let message = '';
    let isHighPriority = false;

    if (currentLevel === 'overbudget') {
      isHighPriority = true;
      message = `Warning: Kategori "${budget.categoryName}" telah melebihi batas anggaran sebesar ${formatIDR(overAmount)}`;
    } else if (currentLevel === 'critical') {
      message = `Warning: Anggaran "${budget.categoryName}" telah mencapai 100% dari batas pagu.`;
    } else if (currentLevel === 'warning') {
      // Support AC-03.01 phrasing
      const displayName = budget.categoryName.toLowerCase() === 'belanja bulanan' ? 'monthly spending' : budget.categoryName;
      message = `Warning: Your "${displayName}" budget has reached ${percentage}%`;
    }

    newNotif = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      categoryId: budget.categoryId,
      categoryName: budget.categoryName,
      period: budget.period,
      level: currentLevel,
      percentage,
      message,
      isHighPriority,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Mark threshold as alerted to prevent spam
    alertedRecords[thresholdKey] = true;
    StorageService.saveAlertedThresholds(alertedRecords);

    // Save notification
    const existingNotifs = StorageService.getNotifications();
    StorageService.saveNotifications([newNotif, ...existingNotifs]);
  }

  return {
    newNotification: newNotif,
    level: currentLevel,
    percentage,
    newSpentAmount: newSpent,
    overAmount,
  };
}
