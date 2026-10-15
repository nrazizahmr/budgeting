import React, { useState, useEffect } from 'react';
import { X, DollarSign, Wallet, Calendar, Check, User, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/budget';
import { formatIDR } from '../utils/formatters';

interface SalaryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

export const SalaryConfigModal: React.FC<SalaryConfigModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [salaryStr, setSalaryStr] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [age, setAge] = useState<number>(24);
  const [salaryCycle, setSalaryCycle] = useState<'1-end' | '25-24'>('1-end');
  const [salaryStartDay, setSalaryStartDay] = useState<number>(1);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSalaryStr(userProfile.monthlyIncome.toString());
      setName(userProfile.name);
      setOccupation(userProfile.occupation);
      setAge(userProfile.age);
      setSalaryCycle(userProfile.salaryCycle);
      setSalaryStartDay(userProfile.salaryCycleStartDay || 1);
      setError('');
    }
  }, [isOpen, userProfile]);

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 12) return;
    setSalaryStr(raw);
    const num = parseInt(raw, 10);
    if (!raw || isNaN(num) || num < 1000) {
      setError('Nominal gaji minimal Rp1.000');
    } else {
      setError('');
    }
  };

  const handleQuickSalary = (val: number) => {
    setSalaryStr(val.toString());
    setError('');
  };

  const parsedSalary = parseInt(salaryStr, 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSalary < 1000) {
      setError('Nominal gaji minimal Rp1.000');
      return;
    }

    onSaveProfile({
      ...userProfile,
      monthlyIncome: parsedSalary,
      name: name.trim() || userProfile.name,
      occupation: occupation.trim() || userProfile.occupation,
      age: Number(age) || 24,
      salaryCycle,
      salaryCycleStartDay: salaryCycle === '25-24' ? 25 : Number(salaryStartDay) || 1,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">Konfigurasi Gaji &amp; Profil</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Sesuaikan nominal pendapatan bulanan &amp; siklus gajian kamu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Salary Amount Input */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nominal Estimasi Gaji / Pendapatan Bulanan (IDR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 font-bold text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={salaryStr ? new Intl.NumberFormat('id-ID').format(parsedSalary) : ''}
                onChange={handleSalaryChange}
                placeholder="10.000.000"
                autoFocus
                className="w-full pl-11 pr-4 py-2.5 text-lg font-bold tabular-nums text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            {error && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{error}</p>}

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[5000000, 8000000, 10000000, 12000000, 15000000, 20000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickSalary(amt)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    parsedSalary === amt
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {formatIDR(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Salary Cycle Selection */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <p className="font-bold text-stone-900 dark:text-white">Siklus Penggajian</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSalaryCycle('1-end');
                  setSalaryStartDay(1);
                }}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  salaryCycle === '1-end'
                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/40 text-stone-900 dark:text-white font-semibold shadow-2xs'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                <p className="text-xs font-bold">1 - Akhir Bulan</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Siklus kalender bulanan standar</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSalaryCycle('25-24');
                  setSalaryStartDay(25);
                }}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  salaryCycle === '25-24'
                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/40 text-stone-900 dark:text-white font-semibold shadow-2xs'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                <p className="text-xs font-bold">Tanggal 25 ke 24</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Siklus gajian tanggal 25</p>
              </button>
            </div>
          </div>

          {/* User Profile Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Nama Pengguna</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Azizah Clara"
                className="w-full px-3 py-2 text-xs text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Usia</label>
              <input
                type="number"
                min={18}
                max={99}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Pekerjaan / Profesi</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Digital Marketer & Content Creator"
              className="w-full px-3 py-2 text-xs text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={Boolean(error) || parsedSalary < 1000}
              className="px-5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-stone-300 dark:disabled:bg-stone-800 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
