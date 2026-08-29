import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/30 bg-[#0A0A0B]/95 text-emerald-400',
    error: 'border-rose-500/30 bg-[#0A0A0B]/95 text-rose-400',
    info: 'border-amber-500/30 bg-[#0A0A0B]/95 text-amber-400',
  };

  return (
    <div
      className={`pointer-events-auto p-4 sm:p-5 rounded-2xl border ${borderStyles[toast.type]} shadow-2xl backdrop-blur-2xl flex items-start justify-between gap-3 animate-fadeIn text-xs`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icons[toast.type]}</div>
        <div className="space-y-1">
          <p className="font-semibold text-white/95">{toast.title}</p>
          {toast.description && <p className="text-white/60 text-[11px] font-light leading-relaxed">{toast.description}</p>}
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="p-1 rounded-full text-white/40 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
