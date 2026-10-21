import React from 'react';
import { flushSync } from 'react-dom';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';

  // The new theme spreads out in a circle from the button where supported;
  // otherwise (or with reduced motion) it simply switches
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as ViewTransitionDoc;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduce) { toggleTheme(); return; }

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = doc.startViewTransition(() => { flushSync(() => toggleTheme()); });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`icon-btn relative overflow-hidden ${className}`}
    >
      {/* Sun and moon swap with a little rotation */}
      <Sun className={`w-4 h-4 absolute transition-all duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100 text-amber-300' : 'rotate-90 scale-0 opacity-0'}`} />
      <Moon className={`w-4 h-4 absolute transition-all duration-500 ${isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
    </button>
  );
};
