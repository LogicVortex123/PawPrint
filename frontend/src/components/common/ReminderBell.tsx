import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Syringe, Calendar, Scale } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Reminder } from '../../types';
import { NotificationToggle } from './NotificationToggle';

const TYPE_ICON: Record<Reminder['type'], React.ReactNode> = {
  vaccination: <Syringe className="w-4 h-4" />,
  appointment: <Calendar className="w-4 h-4" />,
  weight: <Scale className="w-4 h-4" />,
};

const DOT: Record<Reminder['urgency'], string> = {
  urgent: 'bg-rose-500',
  upcoming: 'bg-amber-500',
  info: 'bg-sky-500',
};

const MAX_SHOWN = 6;

// Navbar bell: count of reminders that need action, and a quick list of them
export const ReminderBell: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { reminders } = useAppStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const urgentCount = reminders.filter((r) => r.urgency === 'urgent').length;
  const actionCount = reminders.filter((r) => r.urgency !== 'info').length;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const openReminders = (petId?: string) => {
    setOpen(false);
    navigate(`/features?${petId ? `pet=${petId}&` : ''}tab=reminders`);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button onClick={() => setOpen((o) => !o)} aria-label={actionCount ? `Reminders, ${actionCount} need attention` : 'Reminders'} title="Reminders"
        className="relative p-2 rounded-full text-paw-secondary dark:text-paw-warm-sage bg-white dark:bg-paw-darksurface border border-paw-soft-sage/80 dark:border-paw-darkborder hover:border-paw-forest transition-colors">
        <Bell className="w-4 h-4" />
        {actionCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center ${urgentCount ? 'bg-rose-600' : 'bg-amber-500'}`}>
            {actionCount > 9 ? '9+' : actionCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-[#FAFAF6] dark:bg-paw-darksurface rounded-2xl border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl overflow-hidden z-[60]">
          <div className="px-4 py-3 border-b border-paw-soft-sage/50 dark:border-paw-darkborder">
            <span className="text-sm font-extrabold text-paw-dark dark:text-white">Reminders</span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {reminders.length === 0 ? (
              <p className="px-3 py-6 text-sm text-center text-paw-secondary dark:text-paw-warm-sage">You're all caught up.</p>
            ) : reminders.slice(0, MAX_SHOWN).map((r) => (
              <button key={r.id} onClick={() => openReminders(r.petId)}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-paw-light-sage dark:hover:bg-paw-darkcard transition-colors">
                <span className="relative w-8 h-8 rounded-lg bg-white dark:bg-paw-darkbg text-paw-forest dark:text-paw-sage flex items-center justify-center flex-shrink-0">
                  {TYPE_ICON[r.type]}
                  <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#FAFAF6] dark:ring-paw-darksurface ${DOT[r.urgency]}`} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-paw-dark dark:text-white truncate">{r.petName}: {r.title}</span>
                  <span className="block text-xs text-paw-secondary dark:text-paw-warm-sage">{r.message}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-paw-soft-sage/50 dark:border-paw-darkborder space-y-2">
            <NotificationToggle compact />
            <button onClick={() => openReminders()} className="w-full text-center text-sm font-bold text-paw-forest dark:text-paw-sage hover:underline">
              {reminders.length > MAX_SHOWN ? `See all ${reminders.length} reminders` : 'Open Smart Reminders'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
