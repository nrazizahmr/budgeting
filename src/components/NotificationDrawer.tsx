import React from 'react';
import { X, Bell, AlertTriangle, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { AlertNotification } from '../types/budget';
import { formatDateTime } from '../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AlertNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-bold text-stone-900">Notifikasi Anggaran</h2>
              {notifications.length > 0 && (
                <span className="text-xs text-stone-500">({notifications.length})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-stone-600 hover:text-stone-900 px-2 py-1 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Tandai Dibaca
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-sm font-semibold text-stone-800">Semua Anggaran Terkendali</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Belum ada peringatan batas overbudget atau kuota kritis untuk periode ini.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isOver = notif.level === 'overbudget';
                const isCritical = notif.level === 'critical';
                const isWarning = notif.level === 'warning';

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      notif.isHighPriority
                        ? 'bg-neutral-950 text-white border-neutral-900 shadow-sm'
                        : isCritical
                        ? 'bg-rose-50/70 border-rose-200 text-stone-900'
                        : isWarning
                        ? 'bg-amber-50/70 border-amber-200 text-stone-900'
                        : 'bg-white border-stone-200 text-stone-900'
                    } ${!notif.read ? 'ring-1 ring-rose-400' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isOver ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : isCritical ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-wider ${
                              notif.isHighPriority ? 'text-rose-400' : 'text-stone-500'
                            }`}
                          >
                            {notif.categoryName} · {notif.percentage}%
                          </span>
                          <span
                            className={`text-[10px] ${
                              notif.isHighPriority ? 'text-stone-400' : 'text-stone-400'
                            }`}
                          >
                            {formatDateTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs font-medium leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50/60 flex justify-end">
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium py-1 px-2.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Riwayat Notifikasi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
