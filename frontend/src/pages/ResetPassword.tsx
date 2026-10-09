import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const fieldCls = 'w-full pl-10 pr-10 py-3 rounded-2xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest';

// Step 2 of password reset: opened from the emailed link (?token=...)
export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { resetPassword, showToast } = useAppStore();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : 'This reset link is incomplete. Open it again from the email, or request a new one.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError("The two passwords don't match."); return; }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(token, password);
      showToast('🔐 Password updated — you\'re signed in.');
      navigate('/analytics', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset the password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-paw-dark dark:text-white tracking-tight">Choose a new password</h1>
          <p className="text-sm text-paw-secondary dark:text-paw-warm-sage/80">At least 8 characters. You'll be signed in straight after.</p>
        </div>

        <div className="bg-[#FAFAF6] dark:bg-paw-darksurface rounded-3xl p-8 sm:p-10 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error} {/expired|incomplete|used/i.test(error) && <Link to="/forgot-password" className="font-bold underline">Request a new link</Link>}</span>
              </div>
            )}
            {[
              { label: 'New password', value: password, set: setPassword, auto: 'new-password' },
              { label: 'Confirm new password', value: confirm, set: setConfirm, auto: 'new-password' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-dark dark:text-white mb-1.5">{f.label}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-paw-secondary"><Lock className="w-4 h-4" /></div>
                  <input type={show ? 'text' : 'password'} required minLength={8} autoComplete={f.auto} value={f.value}
                    onChange={(e) => f.set(e.target.value)} disabled={!token} className={fieldCls} />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide passwords' : 'Show passwords'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-paw-secondary hover:text-paw-dark">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading || !token}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft-lg transition-all disabled:opacity-60">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save new password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
