import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ManageBudgetView } from './components/ManageBudgetView';
import { TransactionView } from './components/TransactionView';
import { AnalyticsView } from './components/AnalyticsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { DuplicateBudgetModal } from './components/DuplicateBudgetModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ToastContainer, ToastItem } from './components/Toast';
import { ScenarioHelper } from './components/ScenarioHelper';
import { NotionModal } from './components/NotionModal';
import { SalaryConfigModal } from './components/SalaryConfigModal';
import { StorageService } from './services/storage';
import { evaluateBudgetAlert } from './utils/alertEngine';
import {
  BudgetAllocation,
  Category,
  Transaction,
  AlertNotification,
  UserProfile,
  PaymentMethodType,
} from './types/budget';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budgets' | 'transactions' | 'analytics'>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('October 2026');

  // Core Data
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageService.getProfile());
  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories());
  const [budgets, setBudgets] = useState<BudgetAllocation[]>(StorageService.getBudgets());
  const [transactions, setTransactions] = useState<Transaction[]>(StorageService.getTransactions());
  const [notifications, setNotifications] = useState<AlertNotification[]>(StorageService.getNotifications());
  const [offlineQueue, setOfflineQueue] = useState<Transaction[]>(StorageService.getOfflineQueue());

  // Connectivity state (simulated or real)
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Theme State (Light / Dark mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('budgetin_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('budgetin_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      addToast({
        type: 'info',
        title: next === 'dark' ? 'Mode Gelap Aktif' : 'Mode Terang Aktif',
        message: next === 'dark' ? 'Tema tampilan beralih ke Mode Gelap.' : 'Tema tampilan beralih ke Mode Terang.',
        duration: 2500,
      });
      return next;
    });
  };

  // Modals & Drawers
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState<boolean>(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState<boolean>(false);
  const [prefillTx, setPrefillTx] = useState<any>(undefined);

  // Duplicate Budget Modal (AC-01.03)
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean;
    categoryName: string;
    existingBudget: BudgetAllocation | null;
  }>({
    isOpen: false,
    categoryName: '',
    existingBudget: null,
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSyncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline queue when online restored (AC-02.03)
  const handleSyncOfflineQueue = useCallback(() => {
    const currentQueue = StorageService.getOfflineQueue();
    if (currentQueue.length === 0) return;

    const currentTxs = StorageService.getTransactions();
    const syncedTxs = currentTxs.map((t) =>
      t.syncStatus === 'pending_local' ? { ...t, syncStatus: 'synced' as const } : t
    );

    StorageService.saveTransactions(syncedTxs);
    StorageService.clearOfflineQueue();
    setTransactions(syncedTxs);
    setOfflineQueue([]);

    addToast({
      type: 'success',
      title: 'Sinkronisasi Berhasil',
      message: `${currentQueue.length} data transaksi lokal berhasil dikirimkan ke server.`,
    });
  }, [addToast]);

  const toggleOnlineMode = () => {
    if (!isOnline) {
      setIsOnline(true);
      handleSyncOfflineQueue();
    } else {
      setIsOnline(false);
      addToast({
        type: 'warning',
        title: 'Mode Offline Aktif',
        message: 'Koneksi terputus. Transaksi baru akan disimpan lokal ("Save to local, not sync").',
      });
    }
  };

  // US-01: Save or Update Budget
  const handleSaveBudget = (data: {
    id?: string;
    categoryId: string;
    categoryName: string;
    period: string;
    allocatedAmount: number;
    rolloverEnabled: boolean;
  }) => {
    let updatedBudgets: BudgetAllocation[];
    const isNew = !data.id;

    if (data.id) {
      // Edit existing
      updatedBudgets = budgets.map((b) =>
        b.id === data.id
          ? {
              ...b,
              allocatedAmount: data.allocatedAmount,
              rolloverEnabled: data.rolloverEnabled,
              updatedAt: new Date().toISOString(),
            }
          : b
      );
      addToast({
        type: 'success',
        title: 'Anggaran Diperbarui',
        message: `Anggaran kategori "${data.categoryName}" berhasil disesuaikan menjadi Rp${new Intl.NumberFormat('id-ID').format(data.allocatedAmount)}.`,
      });
    } else {
      // Create new: AC-01.01
      const newBudget: BudgetAllocation = {
        id: `budget-${Date.now()}`,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        period: data.period,
        allocatedAmount: data.allocatedAmount,
        spentAmount: 0, // starts at Rp0
        rolloverEnabled: data.rolloverEnabled,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedBudgets = [newBudget, ...budgets];

      // AC-01.01 exact success notification:
      // "The food and beverage budget has been successfully created."
      const msg =
        data.categoryName.toLowerCase() === 'food and beverage'
          ? 'The food and beverage budget has been successfully created.'
          : `The ${data.categoryName.toLowerCase()} budget has been successfully created.`;

      addToast({
        type: 'success',
        title: 'Budget Created',
        message: msg,
      });
    }

    setBudgets(updatedBudgets);
    StorageService.saveBudgets(updatedBudgets);
  };

  const handleDeleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    StorageService.saveBudgets(updated);
    addToast({
      type: 'info',
      message: 'Anggaran kategori berhasil dihapus.',
    });
  };

  // AC-01.03: Duplicate detected callback
  const handleDuplicateDetected = (categoryName: string, existingBudget: BudgetAllocation) => {
    setDuplicateModal({
      isOpen: true,
      categoryName,
      existingBudget,
    });
  };

  // US-02: Save Transaction
  const handleSaveTransaction = (data: {
    amount: number;
    categoryId: string;
    categoryName: string;
    dateTime: string;
    paymentMethod: PaymentMethodType;
    paymentProvider?: string;
    notes?: string;
    receiptImage?: string;
    receiptName?: string;
  }) => {
    const isPendingSync = !isOnline;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount: data.amount,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      dateTime: data.dateTime,
      paymentMethod: data.paymentMethod,
      paymentProvider: data.paymentProvider,
      notes: data.notes,
      receiptImage: data.receiptImage,
      receiptName: data.receiptName,
      syncStatus: isPendingSync ? 'pending_local' : 'synced',
      createdAt: new Date().toISOString(),
    };

    // Save transaction
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    StorageService.saveTransactions(updatedTxs);

    if (isPendingSync) {
      StorageService.addToOfflineQueue(newTx);
      setOfflineQueue(StorageService.getOfflineQueue());
    }

    // Update target budget quota in real time
    // AC-02.01: "sisa kuota anggaran Entertainment langsung terbarui menjadi Rp350.000"
    const targetBudget = budgets.find((b) => b.categoryId === data.categoryId && b.period === selectedPeriod);

    if (targetBudget) {
      // Evaluate threshold alerts (US-03)
      const evaluation = evaluateBudgetAlert(targetBudget, data.amount);

      const updatedBudgets = budgets.map((b) =>
        b.id === targetBudget.id
          ? {
              ...b,
              spentAmount: evaluation.newSpentAmount,
              updatedAt: new Date().toISOString(),
            }
          : b
      );
      setBudgets(updatedBudgets);
      StorageService.saveBudgets(updatedBudgets);

      // If threshold was crossed (AC-03.01 or AC-03.02), show alert toast & add to notifications
      if (evaluation.newNotification) {
        setNotifications(StorageService.getNotifications());
        addToast({
          type: evaluation.level === 'overbudget' ? 'error' : 'warning',
          title: evaluation.level === 'overbudget' ? 'High Priority Alert' : 'Budget Warning',
          message: evaluation.newNotification.message,
          isHighPriority: evaluation.newNotification.isHighPriority,
          duration: 8000,
        });
      }
    }

    // Close modal
    setIsAddTransactionOpen(false);
    setPrefillTx(undefined);

    // AC-02.01 & AC-02.03 toasts
    if (isPendingSync) {
      // AC-02.03: "sistem menyimpan payload data ke local storage AND menampilkan label 'Save to local, not sync'"
      addToast({
        type: 'warning',
        title: 'Save to local, not sync',
        message: 'Transaksi disimpan di memori lokal. Akan otomatis disinkronkan ke server saat internet online kembali.',
      });
    } else {
      // AC-02.01: "layar menutup form dan menampilkan toast notification: 'The transaction was successfully recorded.'"
      addToast({
        type: 'success',
        title: 'Success',
        message: 'The transaction was successfully recorded.',
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (!txToDelete) return;

    // Refund spent quota if in current period
    const targetBudget = budgets.find((b) => b.categoryId === txToDelete.categoryId && b.period === selectedPeriod);
    if (targetBudget) {
      const updatedBudgets = budgets.map((b) =>
        b.id === targetBudget.id
          ? { ...b, spentAmount: Math.max(0, b.spentAmount - txToDelete.amount) }
          : b
      );
      setBudgets(updatedBudgets);
      StorageService.saveBudgets(updatedBudgets);
    }

    const updatedTxs = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTxs);
    StorageService.saveTransactions(updatedTxs);

    addToast({
      type: 'info',
      message: 'Transaksi berhasil dihapus dan saldo pagu dikembalikan.',
    });
  };

  const handleUpdateSalaryCycle = (cycle: '1-end' | '25-24') => {
    const updatedProfile = { ...userProfile, salaryCycle: cycle };
    setUserProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);
    addToast({
      type: 'info',
      title: 'Siklus Gaji Diperbarui',
      message: cycle === '25-24' ? 'Siklus penggajian tgl 25 ke tgl 24 aktif.' : 'Siklus standar tgl 1 ke akhir bulan aktif.',
    });
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);
    addToast({
      type: 'success',
      title: 'Profil & Gaji Diperbarui',
      message: `Estimasi gaji berhasil disimpan sebesar Rp${new Intl.NumberFormat('id-ID').format(updatedProfile.monthlyIncome)}.`,
    });
  };

  // Scenario Runner for testing all Acceptance Criteria
  const handleRunScenario = (scenarioId: string) => {
    switch (scenarioId) {
      case 'AC-01.01':
        // GIVEN: Manage Budget
        // WHEN: Food and Beverage, Rp3.000.000, October 2026, Save
        setActiveTab('budgets');
        setSelectedPeriod('October 2026');
        // Check if Food and Beverage already exists; if so, delete it first to ensure clean test
        const fnbCat = categories.find((c) => c.name === 'Food and Beverage') || categories[0];
        const withoutFnb = budgets.filter((b) => b.categoryId !== fnbCat.id);
        setBudgets(withoutFnb);
        StorageService.saveBudgets(withoutFnb);

        // Execute save budget
        setTimeout(() => {
          handleSaveBudget({
            categoryId: fnbCat.id,
            categoryName: fnbCat.name,
            period: 'October 2026',
            allocatedAmount: 3000000,
            rolloverEnabled: true,
          });
        }, 150);
        break;

      case 'AC-01.02':
        // Form Add Budget with 0 nominal
        setActiveTab('budgets');
        addToast({
          type: 'info',
          title: 'Test AC-01.02',
          message: 'Lihat form "Add Budget" di tab Manage Budget. Nominal 0 menampilkan pesan inline error dan tombol disabled.',
        });
        break;

      case 'AC-01.03':
        // Duplicate Transportation in October 2026
        setActiveTab('budgets');
        const transBudget = budgets.find((b) => b.categoryName === 'Transportation' && b.period === 'October 2026');
        if (transBudget) {
          handleDuplicateDetected('Transportation', transBudget);
        } else {
          // Add transportation first then trigger
          const transCat = categories.find((c) => c.name === 'Transportation')!;
          handleSaveBudget({
            categoryId: transCat.id,
            categoryName: 'Transportation',
            period: 'October 2026',
            allocatedAmount: 1200000,
            rolloverEnabled: true,
          });
          setTimeout(() => {
            const b = StorageService.getBudgets().find((x) => x.categoryName === 'Transportation')!;
            handleDuplicateDetected('Transportation', b);
          }, 300);
        }
        break;

      case 'AC-02.01':
        // Entertainment has Rp500.000 remaining. Expense Rp150.000 -> remaining Rp350.000
        const entCat = categories.find((c) => c.name === 'Entertainment');
        if (entCat) {
          setPrefillTx({
            categoryId: entCat.id,
            amount: 150000,
            dateTime: '2026-10-14T14:00',
            notes: 'Tiket bioskop XXI premiere & popcorn',
            paymentMethod: 'Rekening Bank',
          });
          setIsAddTransactionOpen(true);
        }
        break;

      case 'AC-02.02':
        // Future date validation on 14 Oct 2026 -> 16 Oct 2026
        setPrefillTx({
          dateTime: '2026-10-16T12:00',
          amount: 50000,
          notes: 'Test future date validation',
        });
        setIsAddTransactionOpen(true);
        break;

      case 'AC-02.03':
        // Offline input test
        setIsOnline(false);
        setPrefillTx({
          amount: 75000,
          notes: 'Transaksi saat offline di MRT',
          dateTime: '2026-10-14T10:00',
        });
        setIsAddTransactionOpen(true);
        break;

      case 'AC-03.01':
        // Belanja Bulanan: currently Rp1.500.000 (75%). Add Rp200.000 -> 85% Warning Kuning
        const groceriesCat = categories.find((c) => c.name === 'Belanja Bulanan');
        if (groceriesCat) {
          setPrefillTx({
            categoryId: groceriesCat.id,
            amount: 200000,
            dateTime: '2026-10-14T15:30',
            notes: 'Restock bahan organik di Ranch Market',
            paymentMethod: 'Kartu Kredit',
          });
          setIsAddTransactionOpen(true);
        }
        break;

      case 'AC-03.02':
        // Snacking: remaining Rp20.000 from Rp500.000 (usage 480.000). Add Rp50.000 -> -Rp30.000 (106% Hitam)
        const snackCat = categories.find((c) => c.name === 'Snacking');
        if (snackCat) {
          setPrefillTx({
            categoryId: snackCat.id,
            amount: 50000,
            dateTime: '2026-10-14T16:00',
            notes: 'Boba cheese tea + matcha cake',
            paymentMethod: 'E-Wallet',
          });
          setIsAddTransactionOpen(true);
        }
        break;

      case 'AC-04.01':
        // Open Dashboard with 3 active categories in October 2026
        setActiveTab('dashboard');
        setSelectedPeriod('October 2026');
        addToast({
          type: 'info',
          title: 'AC-04.01 Loaded',
          message: 'Dashboard aktif memuat total alokasi vs realisasi, sisa anggaran, burn rate, dan 2 charts terintegrasi.',
        });
        break;

      case 'AC-04.02':
        // Empty state test
        StorageService.resetToEmptyState();
        setBudgets([]);
        setTransactions([]);
        setNotifications([]);
        setActiveTab('dashboard');
        addToast({
          type: 'info',
          title: 'AC-04.02 Empty State',
          message: 'Data dikosongkan. Menampilkan ilustrasi Empty State dengan CTA: "No budget data yet. [Start Creating Your First Budget]".',
        });
        break;

      default:
        break;
    }
  };

  const handleResetDefault = () => {
    StorageService.resetToDefault();
    setBudgets(StorageService.getBudgets());
    setTransactions(StorageService.getTransactions());
    setCategories(StorageService.getCategories());
    setUserProfile(StorageService.getProfile());
    setNotifications([]);
    setOfflineQueue([]);
    setIsOnline(true);
    addToast({
      type: 'success',
      title: 'Reset Selesai',
      message: 'Data dikembalikan ke konfigurasi standar October 2026 siap uji skenario.',
    });
  };

  const handleResetEmpty = () => {
    handleRunScenario('AC-04.02');
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0c0a09] text-stone-800 dark:text-stone-100 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900 transition-colors">
      {/* Universal Header following Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddTransaction={() => {
          setPrefillTx(undefined);
          setIsAddTransactionOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenNotionModal={() => setIsNotionModalOpen(true)}
        onOpenSalaryConfig={() => setIsSalaryModalOpen(true)}
        notifications={notifications}
        isOnline={isOnline}
        onToggleOnline={toggleOnlineMode}
        profile={userProfile}
        offlineCount={offlineQueue.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            budgets={budgets}
            transactions={transactions}
            categories={categories}
            selectedPeriod={selectedPeriod}
            onChangePeriod={setSelectedPeriod}
            onNavigateToBudgets={() => setActiveTab('budgets')}
            onOpenAddTransaction={() => {
              setPrefillTx(undefined);
              setIsAddTransactionOpen(true);
            }}
            salaryCycle={userProfile.salaryCycle}
          />
        )}

        {activeTab === 'budgets' && (
          <ManageBudgetView
            budgets={budgets}
            categories={categories}
            userProfile={userProfile}
            selectedPeriod={selectedPeriod}
            onChangePeriod={setSelectedPeriod}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
            onDuplicateDetected={handleDuplicateDetected}
            onUpdateSalaryCycle={handleUpdateSalaryCycle}
            onOpenSalaryConfig={() => setIsSalaryModalOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionView
            transactions={transactions}
            categories={categories}
            onOpenAddModal={() => {
              setPrefillTx(undefined);
              setIsAddTransactionOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onSyncOfflineQueue={handleSyncOfflineQueue}
            isOnline={isOnline}
            offlineCount={offlineQueue.length}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            budgets={budgets}
            transactions={transactions}
            categories={categories}
            selectedPeriod={selectedPeriod}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-6 mt-12 text-center text-xs text-stone-500 dark:text-stone-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 dark:text-white">BudgetIn</span>
            <span>·</span>
            <span>Aplikasi Pengelola Anggaran Personal untuk Wanita Usia 24 Tahun</span>
          </div>
          <div className="text-stone-400 dark:text-stone-500">
            Hak Cipta © 2026 BudgetIn. Waktu Acuan: 14 Oktober 2026.
          </div>
        </div>
      </footer>

      {/* Add / Fast Expense Modal */}
      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => {
          setIsAddTransactionOpen(false);
          setPrefillTx(undefined);
        }}
        categories={categories}
        budgets={budgets.filter((b) => b.period === selectedPeriod)}
        onSaveTransaction={handleSaveTransaction}
        isOnline={isOnline}
        prefill={prefillTx}
      />

      {/* Duplicate Budget Confirmation Modal (AC-01.03) */}
      <DuplicateBudgetModal
        isOpen={duplicateModal.isOpen}
        categoryName={duplicateModal.categoryName}
        onCancel={() => setDuplicateModal({ isOpen: false, categoryName: '', existingBudget: null })}
        onEditExisting={() => {
          setDuplicateModal({ isOpen: false, categoryName: '', existingBudget: null });
          setActiveTab('budgets');
        }}
      />

      {/* In-App Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          const marked = notifications.map((n) => ({ ...n, read: true }));
          setNotifications(marked);
          StorageService.saveNotifications(marked);
        }}
        onClearAll={() => {
          setNotifications([]);
          StorageService.saveNotifications([]);
        }}
      />

      {/* Notion Integration Modal */}
      <NotionModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
        budgets={budgets}
        transactions={transactions}
        onDataImported={(importedBudgets, importedTxs) => {
          if (importedBudgets && importedBudgets.length > 0) {
            setBudgets(importedBudgets);
            StorageService.saveBudgets(importedBudgets);
          }
          if (importedTxs && importedTxs.length > 0) {
            setTransactions(importedTxs);
            StorageService.saveTransactions(importedTxs);
          }
        }}
        onToast={addToast}
      />

      {/* Salary & Profile Config Modal */}
      <SalaryConfigModal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Toasts Stack */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Acceptance Criteria Floating Test Suite Helper */}
      <ScenarioHelper
        onRunScenario={handleRunScenario}
        onResetDefault={handleResetDefault}
        onResetEmpty={handleResetEmpty}
      />
    </div>
  );
}
