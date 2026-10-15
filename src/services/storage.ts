import {
  BudgetAllocation,
  Category,
  Transaction,
  AlertNotification,
  UserProfile,
  AlertLevel,
} from '../types/budget';
import { getAlertLevel } from '../utils/formatters';

const STORAGE_KEYS = {
  BUDGETS: 'aurabudget_budgets_v1',
  TRANSACTIONS: 'aurabudget_transactions_v1',
  CATEGORIES: 'aurabudget_categories_v1',
  NOTIFICATIONS: 'aurabudget_notifications_v1',
  USER_PROFILE: 'aurabudget_user_profile_v1',
  OFFLINE_QUEUE: 'aurabudget_offline_queue_v1',
  ALERTED_THRESHOLDS: 'aurabudget_alerted_thresholds_v1', // prevents notification spam
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Azizah Clara',
  age: 24,
  occupation: 'Digital Marketer & Content Creator',
  monthlyIncome: 12000000, // Rp 12.000.000
  currency: 'IDR',
  salaryCycle: '1-end',
  salaryCycleStartDay: 1,
  avatarUrl: '/src/assets/images/avatar_young_woman_1791961999922.jpg',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-fnb', name: 'Food and Beverage', iconName: 'UtensilsCrossed', color: '#f97316', isDefault: true },
  { id: 'cat-trans', name: 'Transportation', iconName: 'Car', color: '#0284c7', isDefault: true },
  { id: 'cat-groceries', name: 'Belanja Bulanan', iconName: 'ShoppingBag', color: '#eab308', isDefault: true },
  { id: 'cat-snack', name: 'Snacking', iconName: 'Coffee', color: '#10b981', isDefault: true },
  { id: 'cat-ent', name: 'Entertainment', iconName: 'Sparkles', color: '#8b5cf6', isDefault: true },
  { id: 'cat-selfcare', name: 'Self Care & Beauty', iconName: 'Heart', color: '#ec4899', isDefault: true },
  { id: 'cat-bills', name: 'Bills & Utilities', iconName: 'Home', color: '#64748b', isDefault: true },
];

/**
 * Standard default data pre-loaded for October 2026
 * Configured so all scenarios are testable immediately
 */
export const DEFAULT_BUDGETS: BudgetAllocation[] = [
  {
    id: 'b-trans',
    categoryId: 'cat-trans',
    categoryName: 'Transportation',
    period: 'October 2026',
    allocatedAmount: 1200000,
    spentAmount: 650000,
    rolloverEnabled: true,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-14T08:00:00Z',
  },
  {
    id: 'b-groceries',
    categoryId: 'cat-groceries',
    categoryName: 'Belanja Bulanan',
    period: 'October 2026',
    allocatedAmount: 2000000,
    spentAmount: 1500000, // 75% - ready for AC-03.01 (+200.000 -> 85% Warning)
    rolloverEnabled: false,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-14T08:00:00Z',
  },
  {
    id: 'b-snack',
    categoryId: 'cat-snack',
    categoryName: 'Snacking',
    period: 'October 2026',
    allocatedAmount: 500000,
    spentAmount: 480000, // Remaining Rp20.000 - ready for AC-03.02 (+50.000 -> 106% Overbudget)
    rolloverEnabled: true,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-14T08:00:00Z',
  },
  {
    id: 'b-ent',
    categoryId: 'cat-ent',
    categoryName: 'Entertainment',
    period: 'October 2026',
    allocatedAmount: 800000,
    spentAmount: 300000, // Remaining Rp500.000 - ready for AC-02.01 (+150.000 -> Remaining 350.000)
    rolloverEnabled: false,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-14T08:00:00Z',
  },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    amount: 150000,
    categoryId: 'cat-trans',
    categoryName: 'Transportation',
    dateTime: '2026-10-13T10:30:00',
    paymentMethod: 'E-Wallet',
    paymentProvider: 'GoPay',
    notes: 'GrabCar ke kantor pusat',
    syncStatus: 'synced',
    createdAt: '2026-10-13T10:30:00',
  },
  {
    id: 'tx-2',
    amount: 500000,
    categoryId: 'cat-trans',
    categoryName: 'Transportation',
    dateTime: '2026-10-08T09:00:00',
    paymentMethod: 'Rekening Bank',
    paymentProvider: 'BCA',
    notes: 'Top up kartu MRT dan bensin mingguan',
    syncStatus: 'synced',
    createdAt: '2026-10-08T09:00:00',
  },
  {
    id: 'tx-3',
    amount: 1500000,
    categoryId: 'cat-groceries',
    categoryName: 'Belanja Bulanan',
    dateTime: '2026-10-05T14:15:00',
    paymentMethod: 'Kartu Kredit',
    paymentProvider: 'Mandiri Livin',
    notes: 'Belanja stok bahan makanan di GrandLucky',
    syncStatus: 'synced',
    createdAt: '2026-10-05T14:15:00',
  },
  {
    id: 'tx-4',
    amount: 480000,
    categoryId: 'cat-snack',
    categoryName: 'Snacking',
    dateTime: '2026-10-12T16:45:00',
    paymentMethod: 'E-Wallet',
    paymentProvider: 'ShopeePay',
    notes: 'Kopi Fore dan matcha latte mingguan bareng tim',
    syncStatus: 'synced',
    createdAt: '2026-10-12T16:45:00',
  },
  {
    id: 'tx-5',
    amount: 300000,
    categoryId: 'cat-ent',
    categoryName: 'Entertainment',
    dateTime: '2026-10-10T20:00:00',
    paymentMethod: 'Rekening Bank',
    paymentProvider: 'Bank Jago',
    notes: 'Nonton bioskop IMAX & popcorn weekend',
    syncStatus: 'synced',
    createdAt: '2026-10-10T20:00:00',
  },
];

export const StorageService = {
  // Profiles
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  // Categories
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  // Budgets
  getBudgets(): BudgetAllocation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return data ? JSON.parse(data) : DEFAULT_BUDGETS;
    } catch {
      return DEFAULT_BUDGETS;
    }
  },

  saveBudgets(budgets: BudgetAllocation[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  // Transactions
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : DEFAULT_TRANSACTIONS;
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  // Notifications
  getNotifications(): AlertNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveNotifications(notifs: AlertNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  // Threshold records: map of `${period}_${categoryId}_${thresholdLevel}` -> boolean
  // Enforces US-03 rule: Maksimal 1x notifikasi per level ambang batas per kategori dalam satu siklus anggaran
  getAlertedThresholds(): Record<string, boolean> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTED_THRESHOLDS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveAlertedThresholds(records: Record<string, boolean>): void {
    localStorage.setItem(STORAGE_KEYS.ALERTED_THRESHOLDS, JSON.stringify(records));
  },

  // Offline queue
  getOfflineQueue(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToOfflineQueue(tx: Transaction): void {
    const queue = this.getOfflineQueue();
    queue.push(tx);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },

  clearOfflineQueue(): void {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  },

  // Reset to Empty State (for AC-04.02 testing)
  resetToEmptyState(): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ALERTED_THRESHOLDS, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  },

  // Reset to Default Seed Data
  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ALERTED_THRESHOLDS, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  },
};
