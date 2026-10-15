import React from 'react';
import { Bell, Wifi, WifiOff, PlusCircle, Database, User } from 'lucide-react';
import { UserProfile, AlertNotification } from '../types/budget';

interface HeaderProps {
  activeTab: 'dashboard' | 'budgets' | 'transactions' | 'analytics';
  onSelectTab: (tab: 'dashboard' | 'budgets' | 'transactions' | 'analytics') => void;
  onOpenAddTransaction: () => void;
  onOpenNotifications: () => void;
  onOpenNotionModal: () => void;
  onOpenSalaryConfig: () => void;
  notifications: AlertNotification[];
  isOnline: boolean;
  onToggleOnline: () => void;
  profile: UserProfile;
  offlineCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddTransaction,
  onOpenNotifications,
  onOpenNotionModal,
  onOpenSalaryConfig,
  notifications,
  isOnline,
  onToggleOnline,
  profile,
  offlineCount,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-left group flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
              B
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap">
              BudgetIn
            </span>
          </button>
        </div>

        {/* Zone 2: 4–5 nav links, 1–2 word labels, single-line */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-rose-600 border-b-2 border-rose-500 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('budgets')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'budgets'
                ? 'text-rose-600 border-b-2 border-rose-500 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Manage Budget
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-rose-600 border-b-2 border-rose-500 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-rose-600 border-b-2 border-rose-500 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Analytics
          </button>
        </nav>

        {/* Zone 3: 1 primary action + profile/status tools */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Online/Offline Simulator Button */}
          <button
            onClick={onToggleOnline}
            title={isOnline ? 'Online mode (Click to simulate offline)' : 'Offline mode (Click to reconnect)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isOnline
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline {offlineCount > 0 ? `(${offlineCount} unsynced)` : ''}</span>
              </>
            )}
          </button>

          {/* Notion Integration Button */}
          <button
            onClick={onOpenNotionModal}
            title="Integrasi & Sinkronisasi Notion"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden sm:inline">Notion</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifikasi Anggaran"
            className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Quick Trigger */}
          <button
            type="button"
            onClick={onOpenSalaryConfig}
            title="Klik untuk konfigurasi nominal gaji & profil"
            className="flex items-center gap-2 pl-1 border-l border-stone-200 hover:opacity-80 transition-opacity cursor-pointer group text-left"
          >
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shadow-2xs group-hover:ring-2 group-hover:ring-rose-400 transition-all">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold text-stone-900 leading-none group-hover:text-rose-600 transition-colors">
                {profile.name}
              </p>
              <p className="text-stone-500 text-[11px] mt-0.5">{profile.age} th · {profile.currency}</p>
            </div>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200 bg-white py-2 px-2 text-xs font-medium">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`py-1 px-2 rounded cursor-pointer ${activeTab === 'dashboard' ? 'text-rose-600 font-bold' : 'text-stone-600'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('budgets')}
          className={`py-1 px-2 rounded cursor-pointer ${activeTab === 'budgets' ? 'text-rose-600 font-bold' : 'text-stone-600'}`}
        >
          Manage Budget
        </button>
        <button
          onClick={() => onSelectTab('transactions')}
          className={`py-1 px-2 rounded cursor-pointer ${activeTab === 'transactions' ? 'text-rose-600 font-bold' : 'text-stone-600'}`}
        >
          Transactions
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`py-1 px-2 rounded cursor-pointer ${activeTab === 'analytics' ? 'text-rose-600 font-bold' : 'text-stone-600'}`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
