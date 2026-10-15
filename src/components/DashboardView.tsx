import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BudgetAllocation, Transaction, Category } from '../types/budget';
import {
  formatIDR,
  calculateBurnRate,
  getAlertLevel,
  getAlertBadgeStyle,
  parsePeriod,
  getAdjacentPeriod,
  MONTH_LIST,
} from '../utils/formatters';

interface DashboardViewProps {
  budgets: BudgetAllocation[];
  transactions: Transaction[];
  categories: Category[];
  selectedPeriod: string;
  onChangePeriod: (period: string) => void;
  onNavigateToBudgets: () => void;
  onOpenAddTransaction: () => void;
  salaryCycle?: '1-end' | '25-24';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  budgets,
  transactions,
  categories,
  selectedPeriod,
  onChangePeriod,
  onNavigateToBudgets,
  onOpenAddTransaction,
  salaryCycle = '1-end',
}) => {
  const [filterMode, setFilterMode] = useState<'current' | 'last' | 'custom'>('current');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-14');

  // Filter budgets and transactions for the period
  const activeBudgets = budgets.filter((b) => b.period === selectedPeriod);

  // Filter transactions matching period
  const parsedPeriodInfo = parsePeriod(selectedPeriod);
  const activeTransactions = transactions.filter((tx) => {
    if (filterMode === 'custom') {
      const txDate = tx.dateTime.split('T')[0];
      return txDate >= customStartDate && txDate <= customEndDate;
    }
    // Dynamic matching for any Month and Year
    return tx.dateTime.startsWith(parsedPeriodInfo.isoPrefix);
  });

  // Check AC-04.02: Empty state condition
  // If user has no budgets or transactions in current period
  const isEmptyState = activeBudgets.length === 0;

  // Metric 1: Total Budget Dialokasikan vs Total Realisasi Pengeluaran
  const totalAllocated = activeBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spentAmount, 0);

  // Metric 2: Sisa Anggaran Global (Net Remaining)
  const netRemaining = totalAllocated - totalSpent;
  const overallPercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  // Metric 3: Burn Rate (rata-rata pengeluaran per hari vs estimasi hari hingga akhir siklus)
  const burnRateData = calculateBurnRate(
    totalSpent,
    totalAllocated,
    parsedPeriodInfo.monthIndex,
    parsedPeriodInfo.year,
    salaryCycle
  );

  // Prepare data for Chart 2: Pie / Donut Chart (distribusi pengeluaran antar kategori)
  const categorySpendMap: Record<string, { name: string; amount: number; color: string }> = {};
  
  // Aggregate from active transactions or budgets
  activeBudgets.forEach((b, idx) => {
    const cat = categories.find((c) => c.id === b.categoryId);
    const color = cat?.color || ['#f43f5e', '#0284c7', '#eab308', '#10b981', '#8b5cf6', '#ec4899'][idx % 6];
    categorySpendMap[b.categoryId] = {
      name: b.categoryName,
      amount: b.spentAmount,
      color,
    };
  });

  const pieCategories = Object.values(categorySpendMap).filter((item) => item.amount > 0);
  const totalPieAmount = pieCategories.reduce((sum, i) => sum + i.amount, 0);

  // Quick period tab switches
  const handlePeriodTab = (tab: 'current' | 'last' | 'custom') => {
    setFilterMode(tab);
    if (tab === 'current') {
      onChangePeriod('October 2026');
    } else if (tab === 'last') {
      onChangePeriod('September 2026');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Controls: Filter Period */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            US-04 · Analytics &amp; Visualization
          </span>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white mt-0.5">Overview Finansial</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Evaluasi kebiasaan belanja, variance analysis alokasi vs realisasi, dan burn rate harian.
          </p>
        </div>

        {/* Filter Segmented Control & All-Months Navigator */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Universal Month & Year Picker */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs border border-stone-200/60 dark:border-stone-700/60">
            <button
              type="button"
              onClick={() => {
                const prev = getAdjacentPeriod(selectedPeriod, -1);
                onChangePeriod(prev);
              }}
              title="Bulan Sebelumnya"
              className="p-1.5 hover:bg-white dark:hover:bg-stone-700 rounded-lg text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month Select */}
            <select
              value={parsedPeriodInfo.month}
              onChange={(e) => {
                const newMonth = e.target.value;
                onChangePeriod(`${newMonth} ${parsedPeriodInfo.year}`);
              }}
              className="bg-transparent font-bold text-stone-900 dark:text-white py-1 px-1.5 focus:outline-none cursor-pointer"
            >
              {MONTH_LIST.map((m) => (
                <option key={m.value} value={m.value} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                  {m.labelId} ({m.value})
                </option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={parsedPeriodInfo.year}
              onChange={(e) => {
                const newYear = parseInt(e.target.value, 10);
                onChangePeriod(`${parsedPeriodInfo.month} ${newYear}`);
              }}
              className="bg-transparent font-bold text-rose-600 dark:text-rose-400 py-1 px-1.5 focus:outline-none cursor-pointer"
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                  {yr}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                const next = getAdjacentPeriod(selectedPeriod, 1);
                onChangePeriod(next);
              }}
              title="Bulan Berikutnya"
              className="p-1.5 hover:bg-white dark:hover:bg-stone-700 rounded-lg text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => handlePeriodTab('current')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterMode === 'current' && selectedPeriod === 'October 2026'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Oct 2026
            </button>
            <button
              onClick={() => handlePeriodTab('last')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterMode === 'last' && selectedPeriod === 'September 2026'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Sep 2026
            </button>
            <button
              onClick={() => handlePeriodTab('custom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterMode === 'custom'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>

          {filterMode === 'custom' && (
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-xl text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-transparent font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
              />
              <span className="text-stone-400">s/d</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-transparent font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* AC-04.02: Check Empty State */}
      {isEmptyState ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 border border-stone-200 dark:border-stone-800 text-center max-w-xl mx-auto my-8 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 mx-auto flex items-center justify-center mb-5">
            <FolderPlus className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">No budget data yet</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed max-w-md mx-auto">
            Kamu belum membuat anggaran untuk periode ini. Rencanakan batas belanja kamu agar pengeluaran tetap terkontrol dan terhindar dari impulsive spending.
          </p>
          <div className="mt-6 flex justify-center">
            {/* AC-04.02 CTA Button requirement: [Start Creating Your First Budget] */}
            <button
              onClick={onNavigateToBudgets}
              className="px-6 py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Start Creating Your First Budget</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* US-04: Widget Metric Utama (3 Metrics) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Widget 1: Total Budget Dialokasikan vs Total Realisasi Pengeluaran */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between shadow-2xs transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <span className="font-semibold text-stone-600 dark:text-stone-300">Total Alokasi vs Realisasi</span>
                  <span className="tabular-nums font-semibold text-stone-700 dark:text-stone-200">{overallPercentage}% Terpakai</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 dark:text-white tabular-nums">
                    {formatIDR(totalSpent)}
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-medium tabular-nums">
                    / {formatIDR(totalAllocated)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      overallPercentage > 100
                        ? 'bg-neutral-900 dark:bg-neutral-100'
                        : overallPercentage >= 80
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, overallPercentage)}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">
                  Variance: {formatIDR(totalAllocated - totalSpent)} ({100 - overallPercentage}% kapasitas tersisa)
                </p>
              </div>
            </div>

            {/* Widget 2: Sisa Anggaran Global (Net Remaining) */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between shadow-2xs transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <span className="font-semibold text-stone-600 dark:text-stone-300">Sisa Anggaran Global (Net Remaining)</span>
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p
                  className={`text-2xl font-bold tabular-nums ${
                    netRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatIDR(netRemaining)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Rekomendasi / Hari</span>
                <span className="font-bold tabular-nums text-stone-800 dark:text-stone-200">
                  {formatIDR(burnRateData.recommendedDaily)} / hari
                </span>
              </div>
            </div>

            {/* Widget 3: Burn Rate (rata-rata pengeluaran per hari vs estimasi hari hingga akhir siklus) */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between shadow-2xs transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <span className="font-semibold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    <span>Burn Rate Harian</span>
                  </span>
                  <span className="text-stone-400 dark:text-stone-500">
                    Sisa {burnRateData.remainingDays} hari dari {burnRateData.daysInCycle} hari
                  </span>
                </div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white tabular-nums">
                  {formatIDR(burnRateData.dailyBurnRate)}
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-normal ml-1">/ hari</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Proyeksi Akhir Siklus:</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      burnRateData.isPaceOverbudget ? 'text-amber-600 dark:text-amber-400' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {formatIDR(burnRateData.projectedTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row: Chart 1 (Horizontal Bar) & Chart 2 (Donut / Pie) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Chart 1: Bar chart horizontal (realisasi vs alokasi per kategori) */}
            <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xs transition-colors">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                    Chart 1: Realisasi vs Alokasi per Kategori
                  </h2>
                </div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Horizontal Variance</span>
              </div>

              <div className="space-y-5">
                {activeBudgets.map((b) => {
                  const pct = Math.round((b.spentAmount / b.allocatedAmount) * 100);
                  const level = getAlertLevel(pct);
                  const style = getAlertBadgeStyle(level);
                  const barWidth = Math.min(100, pct);

                  return (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{b.categoryName}</span>
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums font-bold text-stone-900 dark:text-white">
                            {formatIDR(b.spentAmount)}
                          </span>
                          <span className="text-stone-400 dark:text-stone-600">/</span>
                          <span className="tabular-nums text-stone-500 dark:text-stone-400">
                            {formatIDR(b.allocatedAmount)}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* Horizontal progress bar */}
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-3 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${style.barColor}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-stone-400 dark:text-stone-500">
                        <span>Status: <strong className={style.text}>{style.label}</strong></span>
                        <span>
                          {b.spentAmount > b.allocatedAmount
                            ? `Melebihi ${formatIDR(b.spentAmount - b.allocatedAmount)}`
                            : `Tersisa ${formatIDR(b.allocatedAmount - b.spentAmount)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Pie / Donut Chart (distribusi persentase pengeluaran antar kategori) */}
            <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xs transition-colors">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                    Chart 2: Distribusi Pengeluaran
                  </h2>
                </div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Share of Spend</span>
              </div>

              {totalPieAmount === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400 dark:text-stone-500">
                  Belum ada realisasi pengeluaran tercatat untuk dibuatkan chart pie.
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {/* SVG Donut Chart */}
                  <div className="relative w-44 h-44 mb-6">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {(() => {
                        let cumulativePercent = 0;
                        return pieCategories.map((item, idx) => {
                          const percent = (item.amount / totalPieAmount) * 100;
                          const strokeDasharray = `${percent} ${100 - percent}`;
                          const strokeDashoffset = -cumulativePercent;
                          cumulativePercent += percent;

                          return (
                            <circle
                              key={idx}
                              cx="50"
                              cy="50"
                              r="38"
                              fill="transparent"
                              stroke={item.color}
                              strokeWidth="16"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              pathLength="100"
                              className="transition-all duration-300 hover:opacity-85"
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider">
                        Total Keluar
                      </span>
                      <span className="text-xs font-bold text-stone-900 dark:text-white tabular-nums">
                        {formatIDR(totalPieAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Legend */}
                  <div className="w-full space-y-2">
                    {pieCategories.map((item, idx) => {
                      const pct = Math.round((item.amount / totalPieAmount) * 100);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-stone-700 dark:text-stone-300 font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums font-semibold text-stone-900 dark:text-white">
                              {formatIDR(item.amount)}
                            </span>
                            <span className="text-stone-400 dark:text-stone-500 text-[11px] tabular-nums w-8 text-right font-medium">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
