import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { IconTile } from '../ui';
import type { Tone } from '../../lib/navigation';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: Tone;
};

// Centered dialog used by every form. Closes on backdrop click or Escape and
// locks page scroll while open. Slides up as a sheet on small screens.
export const Modal: React.FC<ModalProps> = ({ title, onClose, children, maxWidth = 'max-w-lg', subtitle, icon, tone = 'forest' }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 bg-paw-dark/40 dark:bg-black/60 backdrop-blur-sm animate-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${maxWidth} max-h-[92vh] overflow-y-auto bg-white dark:bg-paw-darksurface rounded-t-[28px] sm:rounded-[28px] border border-paw-line dark:border-paw-darkborder shadow-soft-2xl animate-slideUp`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 sm:px-8 pt-6 pb-4 bg-white/95 dark:bg-paw-darksurface/95 backdrop-blur border-b border-paw-line/70 dark:border-paw-darkborder">
          <div className="flex items-center gap-3 min-w-0">
            {icon && <IconTile icon={icon} tone={tone} />}
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-extrabold text-paw-dark dark:text-white truncate">{title}</h3>
              {subtitle && <p className="text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="icon-btn flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 sm:px-8 py-6">{children}</div>
      </div>
    </div>
  );
};

export const inputCls = 'input';

export const labelCls = 'label';

export const primaryBtnCls = 'btn-primary';

export const dangerBtnCls = 'btn-danger-outline';
