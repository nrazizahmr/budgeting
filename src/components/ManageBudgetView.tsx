import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { BudgetAllocation, Category, UserProfile } from '../types/budget';
import {
  formatIDR,
  getAlertLevel,
  getAlertBadgeStyle,
  parsePeriod,
  getAdjacentPeriod,
  MONTH_LIST,
} from '../utils/formatters';

interface ManageBudgetViewProps {
  budgets: BudgetAllocation[];
  categories: Category[];
  userProfile: UserProfile;
  selectedPeriod: string;
  onChangePeriod: (p: string) => void;
  onSaveBudget: (budget: {
    id?: string;
    categoryId: string;
    categoryName: string;
    period: string;
    allocatedAmount: number;
    rolloverEnabled: boolean;
  }) => void;
  onDeleteBudget: (id: string) => void;
  onDuplicateDetected: (categoryName: string, existingBudget: BudgetAllocation) => void;
  onUpdateSalaryCycle: (cycle: '1-end' | '25-24') => void;
  onOpenSalaryConfig: () => void;
}

export const ManageBudgetView: React.FC<ManageBudgetViewProps> = ({
  budgets,
  categories,
  userProfile,
  selectedPeriod,
  onChangePeriod,
  onSaveBudget,
  onDeleteBudget,
  onDuplicateDetected,
  onUpdateSalaryCycle,
  onOpenSalaryConfig,
}) => {
  // Form states
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [nominalStr, setNominalStr] = useState<string>('');
  const [rolloverEnabled, setRolloverEnabled] = useState<boolean>(true);
  const [nominalTouched, setNominalTouched] = useState<boolean>(false);

  // Parse active selected period into Month & Year
  const { month: currentMonthVal, monthLabelId: currentMonthLabel, year: currentYearVal, formattedDisplay } = parsePeriod(selectedPeriod);

  // Generate an extensive, complete list of selectable years
  // Starting from 2020 to 2035+, plus any other year present in existing budgets or selectedPeriod
  const customYearsInBudgets = budgets.map((b) => parsePeriod(b.period).year);
  const minYear = Math.min(2020, currentYearVal, ...customYearsInBudgets);
  const maxYear = Math.max(2035, currentYearVal, ...customYearsInBudgets);
  const yearList: number[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    yearList.push(y);
  }

  // Distinct saved periods with active budget allocations
  const savedPeriodsWithBudgets = Array.from(new Set(budgets.map((b) => b.period))).filter(Boolean);

  // Filter budgets for active selected period
  const periodBudgets = budgets.filter((b) => b.period === selectedPeriod);

  // Financial statistics
  const totalAllocated = periodBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalIncome = userProfile.monthlyIncome;
  const unallocatedIncome = Math.max(0, totalIncome - totalAllocated);

  // Numeric validation: AC-01.02:
  // "Nominal anggaran harus lebih besar dari Rp0"
  const rawNominal = nominalStr.replace(/\D/g, '');
  const parsedNominal = parseInt(rawNominal, 10) || 0;

  let inlineNominalError = '';
  if (nominalTouched) {
    if (!nominalStr || parsedNominal === 0) {
      inlineNominalError = 'Nominal anggaran harus lebih besar dari Rp0';
    } else if (parsedNominal > 999999999999) {
      inlineNominalError = 'Maksimal batas nominal adalah Rp999.999.999.999';
    }
  }

  const isFormValid = selectedCategoryId !== '' && parsedNominal > 0 && !inlineNominalError;

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNominalTouched(true);
    const clean = e.target.value.replace(/\D/g, '');
    if (clean.length > 12) return;
    setNominalStr(clean);
  };

  const handleStartEdit = (b: BudgetAllocation) => {
    setEditingBudgetId(b.id);
    setSelectedCategoryId(b.categoryId);
    setNominalStr(b.allocatedAmount.toString());
    setRolloverEnabled(b.rolloverEnabled);
    setNominalTouched(true);
  };

  const handleCancelForm = () => {
    setEditingBudgetId(null);
    setSelectedCategoryId('');
    setNominalStr('');
    setRolloverEnabled(true);
    setNominalTouched(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNominalTouched(true);

    if (!selectedCategoryId) return;
    if (parsedNominal <= 0) {
      return;
    }

    const catObj = categories.find((c) => c.id === selectedCategoryId);
    const categoryName = catObj ? catObj.name : 'Unknown';

    // Duplicate check: AC-01.03
    // Kategori tidak boleh duplikat dalam satu periode aktif
    const existing = periodBudgets.find(
      (b) => b.categoryId === selectedCategoryId && b.id !== editingBudgetId
    );

    if (existing) {
      // Rejects and opens confirmation modal dialog: AC-01.03
      onDuplicateDetected(categoryName, existing);
      return;
    }

    onSaveBudget({
      id: editingBudgetId || undefined,
      categoryId: selectedCategoryId,
      categoryName,
      period: selectedPeriod,
      allocatedAmount: parsedNominal,
      rolloverEnabled,
    });

    // Reset form
    handleCancelForm();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner: Cycle Preference & Monthly Income Summary */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              US-01 · Alokasi Pengeluaran
            </span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Manage Budget &amp; Alokasi</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Atur batas nominal anggaran untuk semua bulan dan semua tahun secara fleksibel.
          </p>
        </div>

        {/* Cycle & Period Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Salary Cycle Selector */}
          <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => onUpdateSalaryCycle('1-end')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                userProfile.salaryCycle === '1-end'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              1 - Akhir Bulan
            </button>
            <button
              onClick={() => onUpdateSalaryCycle('25-24')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                userProfile.salaryCycle === '25-24'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Siklus Gaji (25 - 24)
            </button>
          </div>

          {/* DYNAMIC MONTH & YEAR PICKER (Semua Bulan & Semua Tahun) */}
          <div className="flex items-center gap-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-1 rounded-xl text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => onChangePeriod(getAdjacentPeriod(selectedPeriod, -1))}
              title="Bulan Sebelumnya"
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Select Month (All 12 Months) */}
            <div className="flex items-center gap-1 px-1.5 py-0.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <select
                value={currentMonthVal}
                onChange={(e) => onChangePeriod(`${e.target.value} ${currentYearVal}`)}
                className="text-stone-900 dark:text-white font-bold focus:outline-none cursor-pointer bg-transparent text-xs"
              >
                {MONTH_LIST.map((m) => (
                  <option key={m.value} value={m.value} className="dark:bg-stone-800 text-stone-900 dark:text-white">
                    {m.labelId}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-stone-300 dark:text-stone-600">/</span>

            {/* Select Year (All Years from 2020 to 2035+) */}
            <div className="px-1.5 py-0.5">
              <select
                value={currentYearVal}
                onChange={(e) => onChangePeriod(`${currentMonthVal} ${e.target.value}`)}
                className="text-stone-900 dark:text-white font-bold focus:outline-none cursor-pointer bg-transparent text-xs"
              >
                {yearList.map((y) => (
                  <option key={y} value={y} className="dark:bg-stone-800 text-stone-900 dark:text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => onChangePeriod(getAdjacentPeriod(selectedPeriod, 1))}
              title="Bulan Berikutnya"
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Jump: Bulan Ini button */}
          {selectedPeriod !== 'October 2026' && (
            <button
              type="button"
              onClick={() => onChangePeriod('October 2026')}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/60"
            >
              Ke Bulan Ini
            </button>
          )}
        </div>
      </div>

      {/* Income Allocation Bar Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-stone-500 dark:text-stone-400">Total Estimasi Pendapatan</p>
              <button
                type="button"
                onClick={onOpenSalaryConfig}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Ubah Gaji</span>
              </button>
            </div>
            <p className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">{formatIDR(totalIncome)}</p>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">
            Gaji &amp; Pendapatan ({userProfile.salaryCycle === '25-24' ? 'Siklus tgl 25' : 'Siklus tgl 1'})
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 transition-colors">
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Total Anggaran Dialokasikan</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">{formatIDR(totalAllocated)}</p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">{periodBudgets.length} Kategori Aktif</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 transition-colors">
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Sisa Pendapatan Belum Dialokasi</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatIDR(unallocatedIncome)}</p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Siap untuk tabungan / investasi</p>
        </div>
      </div>

      {/* Main Grid: Add/Edit Budget Form & Active Allocations List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column: Add Budget / Edit Budget */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 transition-colors">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200 dark:border-stone-800">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              {editingBudgetId ? 'Edit Anggaran Kategori' : 'Form Add Budget'}
            </h2>
            {editingBudgetId && (
              <button
                onClick={handleCancelForm}
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Pilih Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                }}
                disabled={Boolean(editingBudgetId)}
                className="w-full px-3.5 py-2.5 text-sm text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer disabled:bg-stone-50 dark:disabled:bg-stone-800/40"
              >
                <option value="" disabled>-- Pilih Kategori --</option>
                {categories.map((c) => {
                  const isExisting = periodBudgets.some((b) => b.categoryId === c.id && b.id !== editingBudgetId);
                  return (
                    <option key={c.id} value={c.id} className="dark:bg-stone-800">
                      {c.name} {isExisting ? '(Sudah ada di periode ini)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Nominal input with AC-01.02 validation */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Batas Nominal Anggaran <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 font-bold text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={nominalStr ? new Intl.NumberFormat('id-ID').format(parsedNominal) : ''}
                  onChange={handleNominalChange}
                  onBlur={() => setNominalTouched(true)}
                  placeholder="0"
                  className={`w-full pl-11 pr-4 py-2.5 text-base font-bold tabular-nums text-stone-900 dark:text-white bg-white dark:bg-stone-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    inlineNominalError ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20' : 'border-stone-200 dark:border-stone-700'
                  }`}
                />
              </div>

              {/* AC-01.02: Inline error display */}
              {inlineNominalError && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{inlineNominalError}</span>
                </div>
              )}

              {/* Quick nominal buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[500000, 1000000, 2000000, 3000000, 5000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setNominalStr(amt.toString());
                      setNominalTouched(true);
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md transition-colors cursor-pointer"
                  >
                    {formatIDR(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Period with Month & Year dropdowns */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Target Periode Anggaran
                </label>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  {currentMonthLabel} {currentYearVal}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={currentMonthVal}
                  onChange={(e) => onChangePeriod(`${e.target.value} ${currentYearVal}`)}
                  className="w-full px-3 py-2 text-xs font-semibold text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {MONTH_LIST.map((m) => (
                    <option key={m.value} value={m.value} className="dark:bg-stone-800 text-stone-900 dark:text-white">
                      {m.labelId}
                    </option>
                  ))}
                </select>
                <select
                  value={currentYearVal}
                  onChange={(e) => onChangePeriod(`${currentMonthVal} ${e.target.value}`)}
                  className="w-full px-3 py-2 text-xs font-semibold text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {yearList.map((y) => (
                    <option key={y} value={y} className="dark:bg-stone-800 text-stone-900 dark:text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                Anggaran berlaku untuk bulan <strong>{currentMonthLabel} {currentYearVal}</strong> ({selectedPeriod}).
              </p>
            </div>

            {/* Rollover Option Toggle */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Opsi Rollover Anggaran</p>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Pindahkan sisa anggaran bulan lalu ke bulan berjalan secara otomatis.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={rolloverEnabled}
                  onChange={(e) => setRolloverEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-300 dark:bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Submit button: AC-01.01 & AC-01.02 disabled when empty/0 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  !isFormValid
                    ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed shadow-none'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Save Budget</span>
              </button>
            </div>
          </form>
        </div>

        {/* Allocations List Column */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Daftar Alokasi ({currentMonthLabel} {currentYearVal})
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {periodBudgets.length} kategori aktif
              </span>
            </div>

            {/* Saved periods quick switcher */}
            {savedPeriodsWithBudgets.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[10px] text-stone-400 dark:text-stone-500 mr-0.5">Periode tersimpan:</span>
                {savedPeriodsWithBudgets.map((sp) => {
                  const pInfo = parsePeriod(sp);
                  const isCurrent = sp === selectedPeriod;
                  const count = budgets.filter((b) => b.period === sp).length;
                  return (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => onChangePeriod(sp)}
                      className={`px-2 py-0.5 text-[10px] rounded-md font-medium transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-rose-600 text-white font-bold shadow-2xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      {pInfo.monthLabelId} {pInfo.year} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {periodBudgets.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 text-center">
              <HelpCircle className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                Belum Ada Anggaran untuk {currentMonthLabel} {currentYearVal}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                Gunakan form di samping untuk mulai mengalokasikan batas belanja bulanan pada bulan {currentMonthLabel} {currentYearVal}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {periodBudgets.map((budget) => {
                const percentage = Math.round((budget.spentAmount / budget.allocatedAmount) * 100);
                const level = getAlertLevel(percentage);
                const style = getAlertBadgeStyle(level);
                const remaining = budget.allocatedAmount - budget.spentAmount;

                return (
                  <div
                    key={budget.id}
                    className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                        <div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white">{budget.categoryName}</h3>
                          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                            {/* AC-01.01 requirement exact format: "Terpakai: Rp0 / Rp3.000.000 (0%)" */}
                            <span>
                              Terpakai: {formatIDR(budget.spentAmount)} / {formatIDR(budget.allocatedAmount)} ({percentage}%)
                            </span>
                            {budget.rolloverEnabled && (
                              <>
                                <span>·</span>
                                <span className="text-rose-600 dark:text-rose-400 font-medium">Rollover On</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(budget)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Anggaran"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBudget(budget.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Anggaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar (Kuning if 80-99%, Merah if 100%, Hitam if >100%) */}
                    <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all duration-300 ${style.barColor}`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-stone-500 dark:text-stone-400">
                        {remaining >= 0 ? (
                          <>Sisa: <strong className="text-stone-800 dark:text-stone-200 tabular-nums">{formatIDR(remaining)}</strong></>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            Overbudget by {formatIDR(Math.abs(remaining))}
                          </span>
                        )}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
