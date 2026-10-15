import React from 'react';
import {
  LayoutDashboard,
  Target,
  Receipt,
  BarChart3,
  Plus,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'budgets' | 'transactions' | 'analytics';
  onSelectTab: (tab: 'dashboard' | 'budgets' | 'transactions' | 'analytics') => void;
  onOpenAddTransaction: () => void;
  offlineCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddTransaction,
  offlineCount = 0,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200/90 dark:border-stone-800/90 px-3 py-1.5 pb-safe transition-colors shadow-lg"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Tab 1: Dashboard */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
          }`}
        >
          <div
            className={`w-8 h-7 flex items-center justify-center rounded-lg transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-rose-50 dark:bg-rose-950/60'
                : 'bg-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Dashboard</span>
        </button>

        {/* Tab 2: Manage Budget */}
        <button
          type="button"
          onClick={() => onSelectTab('budgets')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'budgets'
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
          }`}
        >
          <div
            className={`w-8 h-7 flex items-center justify-center rounded-lg transition-colors ${
              activeTab === 'budgets'
                ? 'bg-rose-50 dark:bg-rose-950/60'
                : 'bg-transparent'
            }`}
          >
            <Target className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Anggaran</span>
        </button>

        {/* Central Action FAB: + Catat Transaksi */}
        <div className="flex flex-col items-center justify-center px-1">
          <button
            type="button"
            onClick={onOpenAddTransaction}
            title="Catat Pengeluaran Cepat"
            className="w-12 h-12 -mt-5 rounded-full bg-linear-to-tr from-rose-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 active:scale-95 transition-transform hover:brightness-105 cursor-pointer ring-4 ring-white dark:ring-stone-900"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
            + Catat
          </span>
        </div>

        {/* Tab 3: Transactions */}
        <button
          type="button"
          onClick={() => onSelectTab('transactions')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'transactions'
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
          }`}
        >
          <div
            className={`w-8 h-7 flex items-center justify-center rounded-lg transition-colors relative ${
              activeTab === 'transactions'
                ? 'bg-rose-50 dark:bg-rose-950/60'
                : 'bg-transparent'
            }`}
          >
            <Receipt className="w-4 h-4" />
            {offlineCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-stone-900 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Transaksi</span>
        </button>

        {/* Tab 4: Analytics */}
        <button
          type="button"
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
          }`}
        >
          <div
            className={`w-8 h-7 flex items-center justify-center rounded-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-rose-50 dark:bg-rose-950/60'
                : 'bg-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Analitik</span>
        </button>
      </div>
    </nav>
  );
};
