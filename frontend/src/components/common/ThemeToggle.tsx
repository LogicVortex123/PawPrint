import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
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
