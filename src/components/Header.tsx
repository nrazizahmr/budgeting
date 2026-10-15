import React from 'react';
import {
  Bell,
  Wifi,
  WifiOff,
  PlusCircle,
  Database,
  User,
  Sun,
  Moon,
  Smartphone,
  Sliders,
  Monitor,
} from 'lucide-react';
import { UserProfile, AlertNotification } from '../types/budget';
import { ScreenState } from '../hooks/useScreenAdaptor';

interface HeaderProps {
  activeTab: 'dashboard' | 'budgets' | 'transactions' | 'analytics';
  onSelectTab: (tab: 'dashboard' | 'budgets' | 'transactions' | 'analytics') => void;
  onOpenAddTransaction: () => void;
  onOpenNotifications: () => void;
  onOpenNotionModal: () => void;
  onOpenSalaryConfig: () => void;
  onOpenScreenAdaptor: () => void;
  screenState: ScreenState;
  notifications: AlertNotification[];
  isOnline: boolean;
  onToggleOnline: () => void;
  profile: UserProfile;
  offlineCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddTransaction,
  onOpenNotifications,
  onOpenNotionModal,
  onOpenSalaryConfig,
  onOpenScreenAdaptor,
  screenState,
  notifications,
  isOnline,
  onToggleOnline,
  profile,
  offlineCount,
  theme,
  onToggleTheme,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f6]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
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
            <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white whitespace-nowrap">
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
                ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('budgets')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'budgets'
                ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Manage Budget
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Analytics
          </button>
        </nav>

        {/* Zone 3: Actions + Screen Adaptor + Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Screen Adaptor Mode Switcher Button */}
          <button
            type="button"
            onClick={onOpenScreenAdaptor}
            title={`Mode Layar: ${screenState.effectiveCategory} (${screenState.mode === 'auto' ? 'Otomatis' : 'Simulasi'}). Klik untuk ubah.`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-700/60"
          >
            {screenState.isMobile ? (
              <Smartphone className="w-3.5 h-3.5 text-rose-500" />
            ) : screenState.isTablet ? (
              <Sliders className="w-3.5 h-3.5 text-purple-500" />
            ) : (
              <Monitor className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span className="hidden sm:inline text-stone-500 dark:text-stone-400">Layar:</span>
            <span className="font-bold text-stone-900 dark:text-white capitalize">
              {screenState.effectiveCategory}
            </span>
            {screenState.mode === 'auto' && (
              <span className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
                Auto
              </span>
            )}
          </button>

          {/* Online/Offline Simulator Button (visible on tablet+) */}
          <button
            onClick={onToggleOnline}
            title={isOnline ? 'Online mode (Click to simulate offline)' : 'Offline mode (Click to reconnect)'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isOnline
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-200'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Offline {offlineCount > 0 ? `(${offlineCount})` : ''}</span>
              </>
            )}
          </button>

          {/* Notion Integration Button (visible on tablet+) */}
          <button
            onClick={onOpenNotionModal}
            title="Integrasi & Sinkronisasi Notion"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
            <span>Notion</span>
          </button>

          {/* Theme Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Theme Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifikasi Anggaran"
            className="relative p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
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
            className="flex items-center gap-2 pl-1 border-l border-stone-200 dark:border-stone-800 hover:opacity-80 transition-opacity cursor-pointer group text-left"
          >
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900 shadow-2xs group-hover:ring-2 group-hover:ring-rose-400 transition-all">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold text-stone-900 dark:text-white leading-none group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {profile.name}
              </p>
              <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">{profile.age} th · {profile.currency}</p>
            </div>
          </button>

          {/* Primary Action Button (Desktop & Tablet) */}
          <button
            onClick={onOpenAddTransaction}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
