import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast message types — prefix your message to auto-pick the right style:
// "✅ " → success (default green)
// "❌ " → error (red)
// "⚠️ " → warning (amber)
// "ℹ️ " → info (blue)
// No prefix → default success

function resolveType(msg: string): 'success' | 'error' | 'warning' | 'info' {
  if (msg.startsWith('❌') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error')) return 'error';
  if (msg.startsWith('⚠️') || msg.startsWith('🟠') || msg.toLowerCase().includes('offline') || msg.toLowerCase().includes('overdue')) return 'warning';
  if (msg.startsWith('ℹ️') || msg.startsWith('ℹ') || msg.startsWith('🔄')) return 'info';
  return 'success';
}

const styles = {
  success: {
    container: 'bg-paw-forest border-paw-sage/40',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />,
    text: 'text-white',
    close: 'hover:bg-white/10 text-white/80 hover:text-white',
  },
  error: {
    container: 'bg-rose-700 dark:bg-rose-900 border-rose-500/50',
    icon: <AlertCircle className="w-5 h-5 text-rose-200 flex-shrink-0" />,
    text: 'text-white',
    close: 'hover:bg-white/10 text-white/80 hover:text-white',
  },
  warning: {
    container: 'bg-amber-600 dark:bg-amber-800 border-amber-400/40',
    icon: <AlertTriangle className="w-5 h-5 text-amber-200 flex-shrink-0" />,
    text: 'text-white',
    close: 'hover:bg-white/10 text-white/80 hover:text-white',
  },
  info: {
    container: 'bg-sky-700 dark:bg-sky-900 border-sky-400/40',
    icon: <Info className="w-5 h-5 text-sky-200 flex-shrink-0" />,
    text: 'text-white',
    close: 'hover:bg-white/10 text-white/80 hover:text-white',
  },
};

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState('');

  useEffect(() => {
    if (toastMessage) {
      setDisplayMsg(toastMessage);
      setVisible(true);
    } else {
      // animate out
      setVisible(false);
    }
  }, [toastMessage]);

  if (!toastMessage && !displayMsg) return null;

  const type = resolveType(displayMsg);
  const s = styles[type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] max-w-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
      }`}
    >
      <div
        className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl ${s.container} shadow-2xl border backdrop-blur-md`}
      >
        <div className="mt-0.5">{s.icon}</div>
        <span className={`text-sm font-medium leading-snug flex-1 pr-1 ${s.text}`}>{displayMsg}</span>
        <button
          onClick={clearToast}
          className={`p-1 rounded-full transition-colors ml-auto flex-shrink-0 ${s.close}`}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
