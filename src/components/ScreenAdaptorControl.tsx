import React from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Maximize2,
  RotateCw,
  X,
  Check,
  CheckCircle2,
  Gauge,
  Sliders,
} from 'lucide-react';
import { ScreenState, ScreenMode } from '../hooks/useScreenAdaptor';

interface ScreenAdaptorControlProps {
  screenState: ScreenState;
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenAdaptorControl: React.FC<ScreenAdaptorControlProps> = ({
  screenState,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const {
    mode,
    setMode,
    windowWidth,
    windowHeight,
    actualCategory,
    effectiveCategory,
    orientation,
    pixelRatio,
    isTouchDevice,
    simulatedOrientation,
    toggleSimulatedOrientation,
  } = screenState;

  const modeOptions: {
    id: ScreenMode;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'auto',
      title: 'Otomatis (Auto-Responsive)',
      description:
        'Aplikasi otomatis mendeteksi ukuran dan rasio layar perangkat (HP, tablet, atau laptop) dan menyesuaikan tata letak secara dinamis real-time saat layar di-resize.',
      icon: <Sparkles className="w-5 h-5 text-rose-500" />,
      badge: 'Rekomendasi',
    },
    {
      id: 'mobile',
      title: 'Tampilan Mobile Smartphone',
      description:
        'Mengubah aplikasi ke bentuk compact smartphone (rasio 390px) lengkap dengan dock navigasi bawah sentuh, header ringkas, dan card 1 kolom.',
      icon: <Smartphone className="w-5 h-5 text-blue-500" />,
      badge: 'Mobile App',
    },
    {
      id: 'tablet',
      title: 'Tampilan Tablet / iPad',
      description:
        'Tata letak medium (768px) dengan 2 kolom kartu ringkasan dan navigasi adaptif seimbang.',
      icon: <Tablet className="w-5 h-5 text-purple-500" />,
    },
    {
      id: 'desktop',
      title: 'Tampilan Web Desktop Penuh',
      description:
        'Tata letak layar lebar desktop dengan dashboard multi-panel, tabel mutasi lengkap, dan visualisasi chart lebar.',
      icon: <Monitor className="w-5 h-5 text-emerald-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/60 dark:bg-stone-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900 shadow-2xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <span>Penyesuaian Bentuk &amp; Ukuran Layar</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Fitur adaptif otomatis untuk layar Web, Tablet, dan Mobile Smartphone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Device Telemetry Card */}
        <div className="p-6 space-y-6">
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Gauge className="w-3.5 h-3.5 text-rose-500" />
                <span>Deteksi Perangkat Real-Time</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Adaptasi Aktif</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-medium">Resolusi Layar</span>
                <span className="font-bold text-stone-900 dark:text-white font-mono mt-0.5 block">
                  {windowWidth} × {windowHeight}
                </span>
              </div>
              <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-medium">Tipe Fisik</span>
                <span className="font-bold text-stone-900 dark:text-white capitalize mt-0.5 block">
                  {actualCategory === 'mobile' ? 'Smartphone' : actualCategory === 'tablet' ? 'Tablet' : 'Desktop PC'}
                </span>
              </div>
              <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-medium">Orientasi</span>
                <span className="font-bold text-stone-900 dark:text-white capitalize mt-0.5 block">
                  {orientation}
                </span>
              </div>
              <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-medium">Format Aktif</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 capitalize mt-0.5 block">
                  {effectiveCategory} {mode === 'auto' ? '(Auto)' : '(Simulasi)'}
                </span>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Pilih Mode Penyesuaian Tampilan:
            </label>

            <div className="space-y-2">
              {modeOptions.map((opt) => {
                const isSelected = mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                      {opt.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-stone-900 dark:text-white">
                          {opt.title}
                        </span>
                        {opt.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && (
                          <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aktif</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientation rotation tool for mobile/tablet simulation */}
          {(mode === 'mobile' || mode === 'tablet') && (
            <div className="p-3.5 bg-stone-100 dark:bg-stone-800/80 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-stone-700 dark:text-stone-300 font-medium">
                Orientasi Simulasi: <strong className="capitalize">{simulatedOrientation}</strong>
              </span>
              <button
                type="button"
                onClick={toggleSimulatedOrientation}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-700 rounded-lg font-semibold text-stone-800 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Putar (Rotate)</span>
              </button>
            </div>
          )}

          {/* Feature Highlights of the Automatic Adaptation */}
          <div className="border-t border-stone-200 dark:border-stone-800 pt-4">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
              Keunggulan Penyesuaian Otomatis BudgetIn:
            </h4>
            <ul className="text-[11px] text-stone-500 dark:text-stone-400 space-y-1.5">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Mobile Viewport:</strong> Memunculkan <em>Bottom Dock Navigation</em> sentuh jempol dan tombol cepat <em>+ Catat</em>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Fluid Grid:</strong> Kolom KPI otomatis mengecil dari 4 kolom ke 1-2 kolom tanpa terpotong atau horizontal scroll.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Mobile Drawer &amp; Sheet:</strong> Modal otomatis menyesuaikan ke gaya <em>bottom sheet</em> yang nyaman diakses di smartphone.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Terapkan &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
