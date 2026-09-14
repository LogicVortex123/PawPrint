import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useAppStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce-short">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-paw-forest text-white shadow-soft-xl border border-paw-sage/40 backdrop-blur-md">
        <CheckCircle2 className="w-5 h-5 text-paw-warm-sage flex-shrink-0" />
        <span className="text-sm font-medium pr-2">{toastMessage}</span>
        <button
          onClick={clearToast}
          className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors ml-auto"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
