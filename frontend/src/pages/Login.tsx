import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useAppStore();
  const [email, setEmail] = useState('sarah.parent@pawprint.example');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Demo login successful! Welcome back to PawPrint.');
    navigate('/analytics');
  };

  const handleGoogleSignIn = () => {
    showToast('Google OAuth simulated: Connected as sarah@gmail.com');
    navigate('/analytics');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-200">
      {/* Organic Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-paw-light-sage/50 dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-paw-soft-sage/40 dark:bg-paw-darkcard/20 organic-blob-1 blur-2xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-8">
        
        {/* Card Header */}
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
            Welcome Back
          </h1>
          <p className="text-sm text-paw-secondary dark:text-paw-warm-sage/80">
            Log in to manage your pets' health records and reminders.
          </p>
        </div>

        {/* Login Card Form */}
        <div className="bg-[#FAFAF6] dark:bg-paw-darksurface rounded-3xl p-8 sm:p-10 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl">
          
          {/* Mock Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard hover:bg-paw-light-sage/40 dark:hover:bg-paw-darkborder/50 text-sm font-bold text-paw-dark dark:text-white transition-all shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-paw-soft-sage/50 dark:border-paw-darkborder" />
            </div>
            <span className="relative px-4 bg-white dark:bg-paw-darksurface text-xs text-paw-secondary dark:text-paw-warm-sage font-semibold uppercase tracking-wider">
              Or with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-dark dark:text-white">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset link sent to registered email')}
                  className="text-xs font-semibold text-paw-forest dark:text-paw-warm-sage hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-paw-secondary">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your secure password"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-paw-secondary hover:text-paw-dark"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft-lg hover:shadow-soft-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Login to PawPrint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Pre-fill helper */}
          <div className="mt-4 p-3 rounded-2xl bg-paw-light-sage/60 dark:bg-paw-darkcard/50 text-center border border-paw-soft-sage/40">
            <span className="text-[11px] text-paw-secondary dark:text-paw-warm-sage font-medium">
              💡 <em>Frontend Demo Mode: Click Login directly to explore with mock parent account.</em>
            </span>
          </div>

          <div className="mt-6 text-center text-xs text-paw-secondary dark:text-paw-warm-sage">
            Don’t have an account yet?{' '}
            <Link to="/signup" className="font-bold text-paw-forest dark:text-paw-warm-sage hover:underline">
              Create one here →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
