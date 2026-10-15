export type PaymentMethodType = 'Cash' | 'Rekening Bank' | 'E-Wallet' | 'Kartu Kredit';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isDefault?: boolean;
}

export interface BudgetAllocation {
  id: string;
  categoryId: string;
  categoryName: string;
  period: string; // e.g. "October 2026" or "2026-10"
  allocatedAmount: number;
  spentAmount: number;
  rolloverEnabled: boolean;
  rolledOverAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  dateTime: string; // ISO string
  paymentMethod: PaymentMethodType;
  paymentProvider?: string; // e.g. "BCA", "GoPay", "ShopeePay"
  notes?: string;
  receiptImage?: string; // base64 or mock file url
  receiptName?: string;
  syncStatus: 'synced' | 'pending_local';
  createdAt: string;
}

export type AlertLevel = 'normal' | 'warning' | 'critical' | 'overbudget';

export interface AlertNotification {
  id: string;
  categoryId: string;
  categoryName: string;
  period: string;
  level: AlertLevel;
  percentage: number;
  message: string;
  isHighPriority?: boolean;
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  occupation: string;
  monthlyIncome: number;
  currency: string;
  salaryCycle: '1-end' | '25-24';
  salaryCycleStartDay: number;
  avatarUrl?: string;
}
