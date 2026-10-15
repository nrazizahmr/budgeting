import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  CreditCard,
  Wallet,
  Coins,
  Building,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  X,
  RefreshCw,
} from 'lucide-react';
import { Transaction, Category, PaymentMethodType } from '../types/budget';
import { formatIDR, formatDateTime } from '../utils/formatters';

interface TransactionViewProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenAddModal: () => void;
  onDeleteTransaction: (id: string) => void;
  onSyncOfflineQueue: () => void;
  isOnline: boolean;
  offlineCount: number;
}

export const TransactionView: React.FC<TransactionViewProps> = ({
  transactions,
  categories,
  onOpenAddModal,
  onDeleteTransaction,
  onSyncOfflineQueue,
  isOnline,
  offlineCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [viewingReceipt, setViewingReceipt] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.paymentProvider?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || tx.categoryId === selectedCategory;
    const matchesPayment = selectedPayment === 'all' || tx.paymentMethod === selectedPayment;

    return matchesSearch && matchesCategory && matchesPayment;
  });

  const getPaymentIcon = (method: PaymentMethodType) => {
    switch (method) {
      case 'E-Wallet':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'Rekening Bank':
        return <Building className="w-4 h-4 text-sky-600" />;
      case 'Kartu Kredit':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'Cash':
      default:
        return <Coins className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Manajemen Transaksi
          </span>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white mt-0.5">Daftar Mutasi Transaksi</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Pencatatan real-time memotong pagu anggaran seketika dengan dukungan bukti struk dan mode offline.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {offlineCount > 0 && (
            <button
              onClick={onSyncOfflineQueue}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkron {offlineCount} Data Lokal</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Pengeluaran Baru</span>
          </button>
        </div>
      </div>

      {/* Offline Status Alert if any */}
      {!isOnline && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Koneksi internet terputus (Offline Mode)
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900 px-2 py-0.5 rounded-md">
            Save to local, not sync
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi atau catatan..."
            className="w-full pl-9 pr-4 py-2 text-xs text-stone-900 dark:text-white bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-medium px-2.5 py-1.5 rounded-lg text-xs cursor-pointer focus:outline-none"
            >
              <option value="all" className="dark:bg-stone-800">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-stone-800">{c.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-medium px-2.5 py-1.5 rounded-lg text-xs cursor-pointer focus:outline-none"
          >
            <option value="all" className="dark:bg-stone-800">Semua Metode</option>
            <option value="E-Wallet" className="dark:bg-stone-800">E-Wallet</option>
            <option value="Rekening Bank" className="dark:bg-stone-800">Rekening Bank</option>
            <option value="Cash" className="dark:bg-stone-800">Cash</option>
            <option value="Kartu Kredit" className="dark:bg-stone-800">Kartu Kredit</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Tidak Ada Transaksi</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
              Belum ada riwayat transaksi yang cocok dengan filter pencarian.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredTransactions.map((tx) => {
              const isPendingSync = tx.syncStatus === 'pending_local';

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                >
                  {/* Left: Icon, Details, and Notes */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getPaymentIcon(tx.paymentMethod)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-stone-900 dark:text-white truncate">
                          {tx.categoryName}
                        </p>
                        <span className="text-stone-300 dark:text-stone-600 text-xs">·</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          {tx.paymentMethod} {tx.paymentProvider ? `(${tx.paymentProvider})` : ''}
                        </span>

                        {/* AC-02.03: "Save to local, not sync" badge */}
                        {isPendingSync && (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 rounded-md border border-amber-300 dark:border-amber-800 animate-pulse">
                            Save to local, not sync
                          </span>
                        )}
                      </div>

                      {tx.notes && (
                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 line-clamp-1">
                          {tx.notes}
                        </p>
                      )}

                      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                        {formatDateTime(tx.dateTime)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount, Receipt preview trigger, and Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100 dark:border-stone-800">
                    {/* Receipt badge */}
                    {tx.receiptImage && (
                      <button
                        onClick={() => setViewingReceipt(tx)}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-md transition-colors cursor-pointer"
                        title="Lihat Struk"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Struk</span>
                      </button>
                    )}

                    <div className="text-right">
                      <p className="text-sm font-bold text-stone-900 dark:text-white tabular-nums">
                        -{formatIDR(tx.amount)}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for viewing receipt image */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 dark:border-stone-800 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">Bukti Struk Transaksi</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">{viewingReceipt.categoryName} · {formatIDR(viewingReceipt.amount)}</p>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden max-h-96 flex items-center justify-center bg-stone-100 dark:bg-stone-800 p-2">
              {viewingReceipt.receiptImage ? (
                <img
                  src={viewingReceipt.receiptImage}
                  alt="Bukti Struk"
                  className="max-h-80 object-contain rounded"
                />
              ) : (
                <p className="text-xs text-stone-400">File tidak tersedia</p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
