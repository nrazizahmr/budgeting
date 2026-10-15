import React, { useState } from 'react';
import {
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

interface ScenarioHelperProps {
  onRunScenario: (scenarioId: string) => void;
  onResetDefault: () => void;
  onResetEmpty: () => void;
}

export const ScenarioHelper: React.FC<ScenarioHelperProps> = ({
  onRunScenario,
  onResetDefault,
  onResetEmpty,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const scenarios = [
    {
      id: 'AC-01.01',
      title: 'AC-01.01: Buat Alokasi F&B Rp3.000.000',
      desc: 'Pilih "Food and Beverage", Rp3.000.000, October 2026 -> toast sukses & Terpakai: Rp0 / Rp3.000.000 (0%).',
    },
    {
      id: 'AC-01.02',
      title: 'AC-01.02: Validasi Nominal 0 / Kosong',
      desc: 'Buka form Add Budget dengan nominal 0 -> error: "Nominal anggaran harus lebih besar dari Rp0" & tombol disabled.',
    },
    {
      id: 'AC-01.03',
      title: 'AC-01.03: Duplikasi Anggaran Transportation',
      desc: 'Coba buat anggaran baru kategori Transportation di periode yang sama -> dialog konfirmasi muncul.',
    },
    {
      id: 'AC-02.01',
      title: 'AC-02.01: Transaksi Entertainment Rp150.000',
      desc: 'Entertainment sisa Rp500.000, potong Rp150.000 -> sisa Rp350.000 & toast: "The transaction was successfully recorded."',
    },
    {
      id: 'AC-02.02',
      title: 'AC-02.02: Validasi Tanggal Masa Depan (16 Okt 2026)',
      desc: 'Pilih 16 Oktober 2026 -> warning: "The transaction date cannot exceed today" & tombol disabled.',
    },
    {
      id: 'AC-02.03',
      title: 'AC-02.03: Input Transaksi Mode Offline',
      desc: 'Simulasi koneksi offline saat simpan -> label: "Save to local, not sync" & auto sync saat online.',
    },
    {
      id: 'AC-03.01',
      title: 'AC-03.01: Ambang Batas 80% (Warning Kuning)',
      desc: 'Belanja Bulanan dari 75% + Rp200.000 -> 85% Warning notif & bar berubah Kuning.',
    },
    {
      id: 'AC-03.02',
      title: 'AC-03.02: Notifikasi Overbudget (Hitam)',
      desc: 'Snacking sisa Rp20.000 + belanja Rp50.000 -> status -Rp30.000 (106%), notif High Priority & bar Hitam.',
    },
    {
      id: 'AC-04.01',
      title: 'AC-04.01: Ringkasan 3 Kategori Aktif',
      desc: 'Buka Dashboard dengan data October 2026 tersinkron & performa < 1.5 detik.',
    },
    {
      id: 'AC-04.02',
      title: 'AC-04.02: Empty State Pengguna Baru',
      desc: 'Kosongkan data -> tampilkan CTA "No budget data yet. [Start Creating Your First Budget]".',
    },
  ];

  return (
    <div className="fixed bottom-16 sm:bottom-4 right-3 sm:right-4 z-40 max-w-[calc(100vw-24px)] sm:max-w-sm w-auto sm:w-full transition-all">
      <div className="bg-stone-900 text-white rounded-2xl shadow-2xl border border-stone-800 overflow-hidden">
        {/* Header Toggle */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-stone-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-500 flex items-center justify-center text-white text-xs font-bold">
              AC
            </div>
            <div>
              <p className="text-xs font-bold tracking-tight">Acceptance Criteria Test Suite</p>
              <p className="text-[10px] text-stone-400">10 Skenario Pengujian Otomatis</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronUp className="w-4 h-4 text-stone-400" />}
          </div>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="p-3.5 border-t border-stone-800 bg-stone-950 space-y-2.5 max-h-96 overflow-y-auto text-xs">
            {/* Quick Reset Tools */}
            <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
              <button
                onClick={onResetDefault}
                className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Data Standar</span>
              </button>
              <button
                onClick={onResetEmpty}
                className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-rose-300 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Reset Empty (AC-04.02)</span>
              </button>
            </div>

            {/* Scenarios */}
            <div className="space-y-1.5">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => onRunScenario(sc.id)}
                  className="p-2 rounded-lg bg-stone-900/90 hover:bg-stone-800 border border-stone-800/80 cursor-pointer transition-colors group flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-200 group-hover:text-rose-400 transition-colors text-[11px]">
                      {sc.title}
                    </p>
                    <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                      {sc.desc}
                    </p>
                  </div>
                  <Play className="w-3.5 h-3.5 text-stone-500 group-hover:text-rose-400 shrink-0 mt-1 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
