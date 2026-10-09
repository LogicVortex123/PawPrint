import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, MailCheck, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const cardCls = 'bg-[#FAFAF6] dark:bg-paw-darksurface rounded-3xl p-8 sm:p-10 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl';

// Step 1 of password reset: ask for the email and send a one-time link
export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAppStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setSentMessage(await forgotPassword(email.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-paw-dark dark:text-white tracking-tight">Forgot your password?</h1>
          <p className="text-sm text-paw-secondary dark:text-paw-warm-sage/80">
            Enter the email you signed up with and we'll send you a link to choose a new one.
          </p>
        </div>

        <div className={cardCls}>
          {sentMessage ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <MailCheck className="w-7 h-7 text-emerald-700 dark:text-emerald-300" />
              </div>
              <p className="text-sm font-semibold text-paw-dark dark:text-white">{sentMessage}</p>
              <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">The link works once and expires in 30 minutes.</p>
              <button onClick={() => setSentMessage(null)} className="text-xs font-bold text-paw-forest dark:text-paw-warm-sage hover:underline">
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-sm text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-dark dark:text-white mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-paw-secondary"><Mail className="w-4 h-4" /></div>
                  <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft-lg transition-all disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-paw-forest dark:text-paw-warm-sage hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
