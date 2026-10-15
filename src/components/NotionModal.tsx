import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  FileSpreadsheet,
} from 'lucide-react';
import { NotionConfig, NotionService } from '../services/notionClient';
import { BudgetAllocation, Transaction } from '../types/budget';

interface NotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: BudgetAllocation[];
  transactions: Transaction[];
  onDataImported: (budgets: any[], transactions: any[]) => void;
  onToast: (toast: { type: 'success' | 'warning' | 'error' | 'info'; title?: string; message: string }) => void;
}

export const NotionModal: React.FC<NotionModalProps> = ({
  isOpen,
  onClose,
  budgets,
  transactions,
  onDataImported,
  onToast,
}) => {
  const [config, setConfig] = useState<NotionConfig>(NotionService.getConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');

  useEffect(() => {
    if (isOpen) {
      setConfig(NotionService.getConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    NotionService.saveConfig(config);
    onToast({
      type: 'success',
      title: 'Konfigurasi Disimpan',
      message: 'Kredensial Notion disimpan di browser dan siap digunakan.',
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await NotionService.testConnection(config);
    setTestResult(res);
    setIsTesting(false);
    if (res.success) {
      onToast({
        type: 'success',
        title: 'Koneksi Berhasil',
        message: res.message,
      });
    } else {
      onToast({
        type: 'warning',
        title: 'Status Koneksi',
        message: res.message,
      });
    }
  };

  const handlePushAll = async () => {
    setIsTesting(true);
    try {
      const res = await NotionService.pushAll(budgets, transactions, config);
      if (res.success) {
        onToast({
          type: 'success',
          title: 'Export ke Notion Sukses',
          message: res.message,
        });
      } else {
        onToast({
          type: 'error',
          title: 'Gagal Export',
          message: res.message || 'Periksa API Key dan Database ID kamu.',
        });
      }
    } catch {
      onToast({
        type: 'error',
        title: 'Error Jaringan',
        message: 'Endpoint Vercel /api/notion akan aktif penuh setelah deploy ke Vercel.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePullAll = async () => {
    setIsTesting(true);
    try {
      const res = await NotionService.pullAll(config);
      if (res.success && res.budgets && res.transactions) {
        onDataImported(res.budgets, res.transactions);
        onToast({
          type: 'success',
          title: 'Sinkronisasi Selesai',
          message: `Berhasil mengimpor data dari database Notion.`,
        });
      } else {
        onToast({
          type: 'error',
          title: 'Gagal Import',
          message: res.message || 'Periksa konfigurasi Database ID Notion kamu.',
        });
      }
    } catch {
      onToast({
        type: 'error',
        title: 'Error Jaringan',
        message: 'Endpoint Vercel /api/notion akan aktif penuh setelah deploy ke Vercel.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const envSnippet = `NOTION_API_KEY=${config.apiKey || 'secret_your_notion_key'}
NOTION_BUDGETS_DB_ID=${config.budgetsDbId || 'your_budgets_database_id'}
NOTION_TRANSACTIONS_DB_ID=${config.transactionsDbId || 'your_transactions_database_id'}`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              N
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">Integrasi Database Notion &amp; Vercel</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Hubungkan penyimpanan data persistent ke workspace Notion kamu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 px-6 bg-white dark:bg-stone-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'config'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Pengaturan Kredensial &amp; Sync
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'guide'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Panduan Langkah Setup (Step-by-Step)
          </button>
        </div>

        {/* Tab 1: Config */}
        {activeTab === 'config' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Notion Internal Integration Secret (Token)
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3.5 py-2 text-xs font-mono text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                Dibuat di{' '}
                <a
                  href="https://www.notion.so/profile/integrations"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-0.5"
                >
                  notion.so/my-integrations <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Database ID: Anggaran (Budgets)
                </label>
                <input
                  type="text"
                  value={config.budgetsDbId}
                  onChange={(e) => setConfig({ ...config, budgetsDbId: e.target.value })}
                  placeholder="32 karakter hex / string ID database"
                  className="w-full px-3.5 py-2 text-xs font-mono text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Database ID: Transaksi (Transactions)
                </label>
                <input
                  type="text"
                  value={config.transactionsDbId}
                  onChange={(e) => setConfig({ ...config, transactionsDbId: e.target.value })}
                  placeholder="32 karakter hex / string ID database"
                  className="w-full px-3.5 py-2 text-xs font-mono text-stone-900 dark:text-white bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Test result message */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <span className="font-medium text-xs">{testResult.message}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-stone-900 dark:bg-rose-600 text-white rounded-xl hover:bg-stone-800 dark:hover:bg-rose-700 font-semibold cursor-pointer"
              >
                Simpan Konfigurasi
              </button>
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestConnection}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Koneksi</span>
              </button>
              <button
                type="button"
                disabled={isTesting}
                onClick={handlePushAll}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Export Local Data ke Notion</span>
              </button>
              <button
                type="button"
                disabled={isTesting}
                onClick={handlePullAll}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Tarik Data dari Notion</span>
              </button>
            </div>

            {/* Vercel Environment Variables Section */}
            <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-stone-900 dark:text-white">Salin Variabel Lingkungan untuk Vercel (Project Settings)</span>
                <button
                  onClick={copyEnv}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEnv ? 'Tersalin!' : 'Salin Semua'}</span>
                </button>
              </div>
              <pre className="p-3 bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-xl font-mono text-[11px] overflow-x-auto border border-stone-800">
                {envSnippet}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Step-by-Step Guide */}
        {activeTab === 'guide' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 rounded-xl text-stone-800 dark:text-stone-200">
              <p className="font-bold text-rose-900 dark:text-rose-300 mb-1">Kenapa lewat Serverless Vercel (`/api/notion`)?</p>
              <p>
                Notion API melarang request langsung dari browser client demi keamanan token rahasia (`CORS protection`). Aplikasi ini telah dilengkapi Serverless API endpoint di folder <code>api/notion.ts</code> dan konfigurasi <code>vercel.json</code> yang otomatis aktif begitu di-deploy ke Vercel!
              </p>
            </div>

            <div className="space-y-3">
              <div className="border border-stone-200 dark:border-stone-800 rounded-xl p-4 bg-white dark:bg-stone-850">
                <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-1.5">Langkah 1: Buat Integrasi di Notion</h4>
                <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300">
                  <li>Buka <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noreferrer" className="text-rose-600 dark:text-rose-400 font-semibold underline">notion.so/my-integrations</a>.</li>
                  <li>Klik <strong>New integration</strong>, beri nama misal <em>"BudgetIn Bot"</em>.</li>
                  <li>Pilih workspace kamu dan simpan.</li>
                  <li>Salin <strong>Internal Integration Secret</strong> (awalan <code>secret_...</code>).</li>
                </ol>
              </div>

              <div className="border border-stone-200 dark:border-stone-800 rounded-xl p-4 bg-white dark:bg-stone-850">
                <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-1.5">Langkah 2: Buat 2 Database di Halaman Notion</h4>
                <p className="mb-2">Buat halaman Notion baru dan buat 2 tabel inline atau full-page:</p>
                <div className="space-y-2">
                  <div className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg">
                    <p className="font-semibold text-stone-800 dark:text-stone-200">1. Database Budgets:</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      • <strong>Category</strong> (Title)<br />
                      • <strong>Period</strong> (Select, misal: "October 2026")<br />
                      • <strong>Allocated</strong> (Number)<br />
                      • <strong>Spent</strong> (Number)<br />
                      • <strong>Rollover</strong> (Checkbox)
                    </p>
                  </div>
                  <div className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg">
                    <p className="font-semibold text-stone-800 dark:text-stone-200">2. Database Transactions:</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      • <strong>Category</strong> (Title)<br />
                      • <strong>Amount</strong> (Number)<br />
                      • <strong>Date</strong> (Date)<br />
                      • <strong>PaymentMethod</strong> (Select: Cash, E-Wallet, Rekening Bank, Kartu Kredit)<br />
                      • <strong>Provider</strong> (Text)<br />
                      • <strong>Notes</strong> (Text)
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-stone-200 dark:border-stone-800 rounded-xl p-4 bg-white dark:bg-stone-850">
                <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-1.5">Langkah 3: Sambungkan Integrasi ke Database (Connect)</h4>
                <p>
                  Pada masing-masing database di Notion, klik tombol <strong>•••</strong> di pojok kanan atas &gt; pilih <strong>Connections</strong> &gt; pilih integrasi <em>"BudgetIn Bot"</em> yang baru dibuat.
                </p>
                <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                  Salin <strong>Database ID</strong> dari URL Notion kamu: <br />
                  <code>https://www.notion.so/workspace/<strong>[32_karakter_database_id]</strong>?v=...</code>
                </p>
              </div>

              <div className="border border-stone-200 dark:border-stone-800 rounded-xl p-4 bg-white dark:bg-stone-850">
                <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-1.5">Langkah 4: Deploy ke Vercel</h4>
                <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300">
                  <li>Push repository ini ke GitHub/GitLab.</li>
                  <li>Di <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-rose-600 dark:text-rose-400 font-semibold underline">vercel.com</a>, klik <strong>Add New Project</strong> &gt; Import repositori kamu.</li>
                  <li>Framework Preset otomatis terdeteksi sebagai <strong>Vite</strong>.</li>
                  <li>Di bagian <strong>Environment Variables</strong>, tambahkan 3 variabel:</li>
                </ol>
                <div className="p-2.5 bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-lg font-mono text-[11px] mt-2 border border-stone-800">
                  NOTION_API_KEY = secret_...<br />
                  NOTION_BUDGETS_DB_ID = xxxxxxxx...<br />
                  NOTION_TRANSACTIONS_DB_ID = xxxxxxxx...
                </div>
                <p className="mt-2">Klik <strong>Deploy</strong>. Selesai! Web app BudgetIn langsung online dan terhubung ke Notion.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
