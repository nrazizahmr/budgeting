import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface DuplicateBudgetModalProps {
  isOpen: boolean;
  categoryName: string;
  onCancel: () => void;
  onEditExisting: () => void;
}

export const DuplicateBudgetModal: React.FC<DuplicateBudgetModalProps> = ({
  isOpen,
  categoryName,
  onCancel,
  onEditExisting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Anggaran Sudah Ada</h3>
              <p className="text-xs text-stone-500">Duplikasi Kategori Tidak Diizinkan</p>
            </div>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed mb-6">
            The budget for {categoryName.toLowerCase()} already exists. Do you want to edit the existing budget?
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onEditExisting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Edit Budget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
