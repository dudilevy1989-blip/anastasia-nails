import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-white border-stone-200 text-stone-800';
        let icon = <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;

        if (toast.type === 'success') {
          bgClass = 'bg-white border-emerald-200 text-stone-800 shadow-emerald-500/10';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
        } else if (toast.type === 'error') {
          bgClass = 'bg-white border-rose-200 text-stone-800 shadow-rose-500/10';
          icon = <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
        } else if (toast.type === 'warning') {
          bgClass = 'bg-white border-amber-200 text-stone-800 shadow-amber-500/10';
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${bgClass}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 text-right">
              <h4 className="font-semibold text-sm text-stone-900">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-md transition-colors"
              aria-label="סגור"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
