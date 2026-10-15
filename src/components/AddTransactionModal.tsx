import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Category, BudgetAllocation, PaymentMethodType } from '../types/budget';
import { formatIDR, sanitizeInput } from '../utils/formatters';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  budgets: BudgetAllocation[];
  onSaveTransaction: (data: {
    amount: number;
    categoryId: string;
    categoryName: string;
    dateTime: string;
    paymentMethod: PaymentMethodType;
    paymentProvider?: string;
    notes?: string;
    receiptImage?: string;
    receiptName?: string;
  }) => void;
  isOnline: boolean;
  prefill?: {
    categoryId?: string;
    amount?: number;
    dateTime?: string;
    notes?: string;
    paymentMethod?: PaymentMethodType;
  };
}

const PAYMENT_PROVIDERS: Record<PaymentMethodType, string[]> = {
  Cash: ['Tunai Dompet'],
  'Rekening Bank': ['BCA', 'Mandiri Livin', 'Bank Jago', 'BNI', 'BRI'],
  'E-Wallet': ['GoPay', 'ShopeePay', 'OVO', 'DANA'],
  'Kartu Kredit': ['BCA Card', 'Mandiri Signature', 'Jenius Card'],
};

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  budgets,
  onSaveTransaction,
  isOnline,
  prefill,
}) => {
  // Today's reference date in current context: 2026-10-14
  const todayDateString = '2026-10-14';

  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dateTime, setDateTime] = useState<string>('2026-10-14T12:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('E-Wallet');
  const [paymentProvider, setPaymentProvider] = useState<string>('GoPay');
  const [notes, setNotes] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<{ name: string; url: string; size: number } | null>(null);

  // Errors and validations
  const [dateError, setDateError] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [receiptError, setReceiptError] = useState<string>('');

  // Quick stopwatch to show < 15s entry speed
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setSecondsElapsed(0);
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);

      // Default or prefill values
      if (prefill) {
        if (prefill.amount) setAmountStr(prefill.amount.toString());
        if (prefill.categoryId) setCategoryId(prefill.categoryId);
        if (prefill.dateTime) setDateTime(prefill.dateTime);
        if (prefill.notes) setNotes(prefill.notes);
        if (prefill.paymentMethod) setPaymentMethod(prefill.paymentMethod);
      } else {
        setAmountStr('');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        setDateTime('2026-10-14T12:00');
        setPaymentMethod('E-Wallet');
        setPaymentProvider('GoPay');
        setNotes('');
        setReceiptFile(null);
      }
      setDateError('');
      setAmountError('');
      setReceiptError('');
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, prefill, categories]);

  // Date validation: AC-02.02: Future date check
  const handleDateChange = (val: string) => {
    setDateTime(val);
    if (!val) {
      setDateError('Tanggal transaksi wajib diisi');
      return;
    }
    // Compare YYYY-MM-DD
    const inputDatePart = val.split('T')[0];
    if (inputDatePart > todayDateString) {
      // AC-02.02 requirement: "The transaction date cannot exceed today"
      setDateError('The transaction date cannot exceed today');
    } else {
      setDateError('');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 12) return; // Max 12 digits
    setAmountStr(raw);
    const num = parseInt(raw, 10);
    if (!raw || isNaN(num) || num < 1) {
      setAmountError('Nominal harus minimal Rp1');
    } else {
      setAmountError('');
    }
  };

  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toString());
    setAmountError('');
  };

  const handlePaymentMethodChange = (m: PaymentMethodType) => {
    setPaymentMethod(m);
    const providers = PAYMENT_PROVIDERS[m];
    setPaymentProvider(providers[0] || '');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiptError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError('Ukuran file maksimal 5MB');
      return;
    }

    // Validate type (.jpg, .jpeg, .png, .pdf)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setReceiptError('Format struk harus .JPG, .PNG, atau .PDF');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptFile({
        name: file.name,
        url: event.target?.result as string,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  // Find target budget for live remaining balance calculation
  const selectedBudget = budgets.find((b) => b.categoryId === categoryId);
  const parsedAmount = parseInt(amountStr, 10) || 0;
  const currentRemaining = selectedBudget
    ? selectedBudget.allocatedAmount - selectedBudget.spentAmount
    : 0;
  const projectedRemaining = selectedBudget ? currentRemaining - parsedAmount : 0;

  // Validation state: AC-02.02 -> Tombol "Simpan" dinonaktifkan jika future date
  const isDateInvalid = Boolean(dateError) || dateTime.split('T')[0] > todayDateString;
  const isAmountInvalid = !amountStr || parsedAmount < 1 || Boolean(amountError);
  const isCategoryInvalid = !categoryId;
  const isSubmitDisabled = isDateInvalid || isAmountInvalid || isCategoryInvalid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const catObj = categories.find((c) => c.id === categoryId);
    const categoryName = catObj ? catObj.name : 'Uncategorized';
    const sanitizedNotes = sanitizeInput(notes);

    onSaveTransaction({
      amount: parsedAmount,
      categoryId,
      categoryName,
      dateTime,
      paymentMethod,
      paymentProvider,
      notes: sanitizedNotes,
      receiptImage: receiptFile?.url,
      receiptName: receiptFile?.name,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Catat Pengeluaran Cepat</h2>
              <p className="text-xs text-stone-500 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>Input dalam &lt;15 detik</span>
                <span className="text-stone-300">·</span>
                <span className="font-mono text-stone-600">{secondsElapsed}s</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline indicator notice if applicable */}
        {!isOnline && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <span>Offline Mode: Transaksi akan tersimpan lokal dan disinkronkan saat online.</span>
            <span className="font-bold text-[10px] bg-amber-200/80 px-2 py-0.5 rounded">Save to local, not sync</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nominal Pengeluaran (amount) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr ? new Intl.NumberFormat('id-ID').format(parseInt(amountStr, 10)) : ''}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className={`w-full pl-11 pr-4 py-2.5 text-lg font-bold tabular-nums text-stone-900 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  amountError ? 'border-rose-300 bg-rose-50/30' : 'border-stone-200'
                }`}
              />
            </div>
            {amountError && <p className="text-xs text-rose-600 mt-1">{amountError}</p>}

            {/* Quick shortcuts */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[25000, 50000, 150000, 200000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-2.5 py-1 text-[11px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
                >
                  +{formatIDR(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Kategori Anggaran (category_id) <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-stone-900 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="" disabled>Pilih kategori aktif...</option>
              {categories.map((c) => {
                const b = budgets.find((item) => item.categoryId === c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} {b ? `(Tersisa: ${formatIDR(b.allocatedAmount - b.spentAmount)})` : '(Belum dialokasi)'}
                  </option>
                );
              })}
            </select>

            {/* Live budget impact preview */}
            {selectedBudget && (
              <div className="mt-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-500">Sisa Kuota Saat Ini: </span>
                  <span className="font-semibold tabular-nums text-stone-800">{formatIDR(currentRemaining)}</span>
                </div>
                <div>
                  <span className="text-stone-500">Setelah Transaksi: </span>
                  <span
                    className={`font-bold tabular-nums ${
                      projectedRemaining < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatIDR(projectedRemaining)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Date Time Picker: AC-02.02 validation */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Waktu Transaksi (date_time) <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => handleDateChange(e.target.value)}
              className={`w-full px-3.5 py-2 text-sm text-stone-900 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                dateError ? 'border-rose-400 bg-rose-50/50' : 'border-stone-200'
              }`}
            />
            {dateError ? (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{dateError}</span>
              </div>
            ) : (
              <p className="text-[11px] text-stone-500 mt-1">
                Hari ini: 14 Oktober 2026. Transaksi masa depan tidak diperbolehkan.
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Metode Pembayaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value as PaymentMethodType)}
                className="w-full px-3 py-2 text-sm text-stone-900 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="E-Wallet">E-Wallet</option>
                <option value="Rekening Bank">Rekening Bank</option>
                <option value="Cash">Cash</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Penyedia / Dompet
              </label>
              <select
                value={paymentProvider}
                onChange={(e) => setPaymentProvider(e.target.value)}
                className="w-full px-3 py-2 text-sm text-stone-900 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                {PAYMENT_PROVIDERS[paymentMethod]?.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes (Max 250 characters, auto-sanitized) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700">Catatan (notes)</label>
              <span className="text-[10px] text-stone-400">{notes.length}/250</span>
            </div>
            <input
              type="text"
              maxLength={250}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Makan siang bareng rekan kerja, Fore Coffee"
              className="w-full px-3.5 py-2 text-sm text-stone-900 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Receipt Image File upload (Max 5MB, JPG/PNG/PDF) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Bukti Struk (receipt_image)
            </label>
            {receiptFile ? (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-stone-800 truncate">{receiptFile.name}</p>
                    <p className="text-[10px] text-stone-500">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptFile(null)}
                  className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-stone-200 hover:border-rose-400 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors bg-stone-50/50 hover:bg-rose-50/20">
                <Upload className="w-4 h-4 text-stone-400" />
                <span className="text-xs font-medium text-stone-600">Unggah Struk (.JPG, .PNG, .PDF, Max 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
            {receiptError && <p className="text-xs text-rose-600 mt-1">{receiptError}</p>}
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`px-5 py-2.5 text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                isSubmitDisabled
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
