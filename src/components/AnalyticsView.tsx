import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { BudgetAllocation, Transaction, Category } from '../types/budget';
import { formatIDR, getAlertLevel, getAlertBadgeStyle } from '../utils/formatters';

interface AnalyticsViewProps {
  budgets: BudgetAllocation[];
  transactions: Transaction[];
  categories: Category[];
  selectedPeriod: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  budgets,
  transactions,
  categories,
  selectedPeriod,
}) => {
  const periodBudgets = budgets.filter((b) => b.period === selectedPeriod);
  const totalAllocated = periodBudgets.reduce((s, b) => s + b.allocatedAmount, 0);
  const totalSpent = periodBudgets.reduce((s, b) => s + b.spentAmount, 0);

  const exportCSV = () => {
    const headers = ['Category', 'Period', 'Allocated', 'Spent', 'Remaining', 'UsagePercentage'];
    const rows = periodBudgets.map((b) => [
      `"${b.categoryName}"`,
      `"${b.period}"`,
      b.allocatedAmount,
      b.spentAmount,
      b.allocatedAmount - b.spentAmount,
      `${Math.round((b.spentAmount / b.allocatedAmount) * 100)}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BudgetIn_Report_${selectedPeriod.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Evaluasi Kebiasaan Belanja
          </span>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white mt-0.5">Analisis Pengeluaran &amp; Variance</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Laporan terperinci selisih pagu anggaran vs realisasi per kategori untuk evaluasi siklus berikutnya.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Variance Analysis Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs transition-colors">
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white">Tabel Variance Analysis ({selectedPeriod})</h2>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">{periodBudgets.length} Kategori Dipantau</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 font-medium">
              <tr>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Alokasi Pagu</th>
                <th className="py-3 px-4 text-right">Realisasi Keluar</th>
                <th className="py-3 px-4 text-right">Variance (Selisih)</th>
                <th className="py-3 px-4 text-right">Realisasi (%)</th>
                <th className="py-3 px-4 text-center">Status Ambang Batas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {periodBudgets.map((b) => {
                const variance = b.allocatedAmount - b.spentAmount;
                const percentage = Math.round((b.spentAmount / b.allocatedAmount) * 100);
                const level = getAlertLevel(percentage);
                const style = getAlertBadgeStyle(level);

                return (
                  <tr key={b.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-white">{b.categoryName}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-stone-700 dark:text-stone-300 tabular-nums">
                      {formatIDR(b.allocatedAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-stone-900 dark:text-white tabular-nums">
                      {formatIDR(b.spentAmount)}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold tabular-nums ${
                      variance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {variance < 0 ? `-${formatIDR(Math.abs(variance))}` : formatIDR(variance)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums text-stone-800 dark:text-stone-200">
                      {percentage}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-stone-50/70 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 font-bold text-stone-900 dark:text-white">
              <tr>
                <td className="py-3 px-4">Total Akumulasi</td>
                <td className="py-3 px-4 text-right tabular-nums">{formatIDR(totalAllocated)}</td>
                <td className="py-3 px-4 text-right tabular-nums">{formatIDR(totalSpent)}</td>
                <td className={`py-3 px-4 text-right tabular-nums ${
                  totalAllocated - totalSpent < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {formatIDR(totalAllocated - totalSpent)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums">
                  {totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}%
                </td>
                <td className="py-3 px-4 text-center text-stone-400 font-normal text-[11px]">
                  Ringkasan Keseluruhan
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Financial Health Tips for 24-year-old Woman */}
      <div className="bg-gradient-to-br from-rose-50/50 via-white to-stone-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 p-6 rounded-2xl border border-rose-100 dark:border-stone-800 shadow-2xs transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-white">Insight &amp; Tips Budgeting Wanita Usia 24 Tahun</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600 dark:text-stone-300">
          <div className="p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
            <p className="font-bold text-stone-900 dark:text-white mb-1">Prinsip 50/30/20 Sederhana</p>
            <p className="leading-relaxed">
              Alokasikan 50% untuk kebutuhan pokok (kos, groceries, transport), 30% untuk lifestyle &amp; self-care, serta 20% langsung ke tabungan darurat atau reksadana.
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
            <p className="font-bold text-stone-900 dark:text-white mb-1">Mencegah Kebocoran Kafein &amp; Jajan</p>
            <p className="leading-relaxed">
              Kategori <strong>Snacking</strong> sering kali menjadi overbudget tanpa disadari. Tetapkan budget mingguan agar tidak impulsif saat checkout via aplikasi ride-hailing.
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
            <p className="font-bold text-stone-900 dark:text-white mb-1">Manfaatkan Rollover Budget</p>
            <p className="leading-relaxed">
              Jika bulan ini anggaran fashion atau entertainment kamu tersisa, aktifkan <strong>Rollover</strong> agar sisa nominal dialihkan menambah porsi bulan berikutnya!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
