import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X, Bell } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
  isHighPriority?: boolean;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getStyle = () => {
    if (toast.isHighPriority) {
      return {
        bg: 'bg-neutral-950 text-white border-neutral-800',
        icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
      };
    }
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-white text-stone-900 border-emerald-200 shadow-lg',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 text-amber-950 border-amber-300 shadow-lg',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-50 text-rose-950 border-rose-300 shadow-lg',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-white text-stone-900 border-stone-200 shadow-lg',
          icon: <Bell className="w-5 h-5 text-stone-600 shrink-0 mt-0.5" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div
      role="alert"
      className={`pointer-events-auto p-4 rounded-xl border flex items-start gap-3 transition-all transform duration-200 animate-in slide-in-from-top-2 ${style.bg}`}
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-xs font-bold mb-0.5 uppercase tracking-wider">{toast.title}</p>}
        <p className="text-xs leading-relaxed font-medium">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-black/5 text-current opacity-70 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
