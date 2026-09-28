import React, { useEffect } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
};

// Centered dialog used by the edit forms. Closes on backdrop click or Escape.
export const Modal: React.FC<ModalProps> = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-[#FAFAF6] dark:bg-paw-darksurface rounded-[28px] p-6 sm:p-8 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-paw-dark dark:text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-paw-secondary hover:text-paw-dark dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const inputCls = "w-full px-4 py-2.5 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest";

export const labelCls = "block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5";

export const primaryBtnCls = "px-6 py-2.5 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft transition-all disabled:opacity-60";

export const dangerBtnCls = "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-60";
