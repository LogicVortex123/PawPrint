import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Heart, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { requestGoogleIdToken } from '../lib/googleIdentity';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, googleLogin, authLoading, authError, clearAuthError, showToast } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Optional pet info for onboarding personalisation — not sent to backend yet
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<'dog' | 'cat' | 'other'>('dog');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);

    try {
      await signup(name, email, password);
      const firstName = name.split(' ')[0];
      const petPart = petName ? ` Get ${petName}'s first profile set up right away!` : '';
      showToast(`Welcome to PawPrint, ${firstName}! 🐾${petPart}`);
      navigate('/analytics');
    } catch {
      // error already in store
    }
  };

  const handleFieldChange = () => {
    if (authError) clearAuthError();
    if (passwordMismatch) setPasswordMismatch(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const idToken = await requestGoogleIdToken();
      await googleLogin(idToken);
      const firstName = useAppStore.getState().user?.name?.split(' ')[0] || 'there';
      showToast(`Account created! Welcome, ${firstName}! 🐾`);
      navigate('/analytics');
    } catch (err) {
      if (!useAppStore.getState().authError) {
        const msg = err instanceof Error ? err.message : 'Google Sign-In failed';
        showToast(`❌ ${msg}`);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-200">
      {/* Background blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-paw-light-sage/50 dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-paw-soft-sage/40 dark:bg-paw-darkcard/20 organic-blob-2 blur-2xl -z-10 pointer-events-none" />

      <div className="w-full max-w-lg space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-paw-forest shadow-md group-hover:scale-105 transition-transform">
              <img src="/logo.jpeg" alt="PawPrint" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-extrabold text-paw-forest dark:text-paw-light-sage tracking-tight font-sans">
              PawPrint
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold text-paw-dark dark:text-white tracking-tight">
            Create your free account
          </h1>
          <p className="text-sm text-paw-secondary dark:text-paw-warm-sage/80">
            Join thousands of pet parents tracking their pets' health — it's free, always.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#FAFAF6] dark:bg-paw-darksurface rounded-3xl p-8 sm:p-10 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl">

          {/* Server error banner */}
          {(authError || passwordMismatch) && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{passwordMismatch ? "Passwords don't match — please check and try again" : authError}</span>
            </div>
          )}

          {/* Google Sign-Up */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || authLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard hover:bg-paw-light-sage/40 dark:hover:bg-paw-darkborder/50 text-sm font-bold text-paw-dark dark:text-white transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Sign up with Google</span>
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-paw-soft-sage/50 dark:border-paw-darkborder" />
            </div>
            <span className="relative px-4 bg-[#FAFAF6] dark:bg-paw-darksurface text-xs text-paw-secondary dark:text-paw-warm-sage font-semibold uppercase tracking-wider">
              Or fill in details
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-paw-dark dark:text-white mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-paw-secondary">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); handleFieldChange(); }}
                  placeholder="Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-paw-dark dark:text-white mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-paw-secondary">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); handleFieldChange(); }}
                  placeholder="sarah@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest transition-colors"
                />
              </div>
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-dark dark:text-white mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-paw-secondary">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); handleFieldChange(); }}
                    placeholder="Min 8 chars"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-dark dark:text-white mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-paw-secondary">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); handleFieldChange(); }}
                    placeholder="Confirm"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${passwordMismatch ? 'border-rose-400 dark:border-rose-600' : 'border-paw-soft-sage dark:border-paw-darkborder'} bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest transition-colors`}
                  />
                </div>
              </div>
            </div>

            {/* Optional pet info */}
            <div className="p-4 rounded-2xl bg-paw-light-sage/60 dark:bg-paw-darkcard/50 border border-paw-soft-sage/60 dark:border-paw-darkborder space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Tell Us About Your Pet (Optional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Pet Name (e.g. Luna)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-white dark:bg-paw-darksurface text-paw-dark dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-paw-forest"
                />
                <select
                  value={petSpecies}
                  onChange={(e) => setPetSpecies(e.target.value as 'dog' | 'cat' | 'other')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-white dark:bg-paw-darksurface text-paw-dark dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-paw-forest"
                >
                  <option value="dog">🐶 Dog</option>
                  <option value="cat">🐱 Cat</option>
                  <option value="other">🐾 Other Friend</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft-lg hover:shadow-soft-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account…</span>
                  </>
                ) : (
                  <>
                    <span>Create PawPrint Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-paw-secondary dark:text-paw-warm-sage">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-paw-forest dark:text-paw-warm-sage hover:underline">
              Log in here →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
