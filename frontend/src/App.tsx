import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GlobalEffects } from './components/common/GlobalEffects';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { useAppStore } from './store/useAppStore';

// Every page except the landing page is loaded on demand, so the first visit
// downloads only what it shows (pages export named components)
const page = <K extends string>(load: () => Promise<Record<K, React.ComponentType>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })));

const Features = page(() => import('./pages/Features'), 'Features');
const About = page(() => import('./pages/About'), 'About');
const Roadmap = page(() => import('./pages/Roadmap'), 'Roadmap');
const Analytics = page(() => import('./pages/Analytics'), 'Analytics');
const Login = page(() => import('./pages/Login'), 'Login');
const Signup = page(() => import('./pages/Signup'), 'Signup');
const Settings = page(() => import('./pages/Settings'), 'Settings');
const EmergencyMode = page(() => import('./pages/EmergencyMode'), 'EmergencyMode');
const HealthSummary = page(() => import('./pages/HealthSummary'), 'HealthSummary');
const ForgotPassword = page(() => import('./pages/ForgotPassword'), 'ForgotPassword');
const ResetPassword = page(() => import('./pages/ResetPassword'), 'ResetPassword');
const SharedRecord = page(() => import('./pages/SharedRecord'), 'SharedRecord');
const NotFound = page(() => import('./pages/NotFound'), 'NotFound');

const PageLoader = () => (
  <div className="py-32 flex flex-col items-center gap-3 text-paw-secondary dark:text-paw-warm-sage" role="status" aria-label="Loading page">
    <Loader2 className="w-7 h-7 animate-spin text-paw-forest dark:text-paw-sage" />
    <span className="text-xs font-semibold">Fetching treats…</span>
  </div>
);

// Signed-in app pages use the sidebar layout; everything else gets the public navbar + footer
const APP_PATHS = ['/features', '/analytics', '/settings'];

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // Links like /#features scroll to that section once the page has rendered
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

// Wraps any route that requires the user to be logged in.
// If they're not authenticated, they get sent to /login with a
// redirect param so we can bounce them back after they sign in.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  const { pathname, search } = useLocation();

  if (!isAuthenticated) {
    // Navigations run as transitions, so right after "Log out → home page" the
    // old protected page can render once more; don't hijack that with /login
    if (window.location.pathname !== pathname) return null;
    return <Navigate to={`/login?redirect=${encodeURIComponent(pathname + search)}`} replace />;
  }

  return <>{children}</>;
}

export const App: React.FC = () => {
  const { theme, isAuthenticated, fetchPets, fetchMe } = useAppStore();
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Covers a page refresh: the login/signup/googleLogin actions already fetch
  // pets at the moment of logging in, but a session restored from a stored
  // token on reload never runs those, so it needs its own fetch here.
  useEffect(() => {
    if (isAuthenticated) {
      fetchPets();
      // Refresh the stored user so settings/preferences are current
      fetchMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const routes = (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<ProtectedRoute><Features /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/features" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><EmergencyMode /></ProtectedRoute>} />
          <Route path="/pets/:petId/summary" element={<ProtectedRoute><HealthSummary /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Public, read-only record a vet/sitter opens from a shared link */}
          <Route path="/share/:token" element={<SharedRecord />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );

  const inApp = isAuthenticated && APP_PATHS.some((p) => pathname.startsWith(p));
  // Auth screens are full-bleed split layouts with their own header
  const bare = ['/login', '/signup'].includes(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-paw-cream dark:bg-paw-darkbg print:bg-white text-paw-dark dark:text-white transition-colors duration-200">
      <ScrollToTop />
      <GlobalEffects />
      {inApp ? (
        <AppShell>{routes}</AppShell>
      ) : (
        <>
          {!bare && <Navbar />}
          <main className="flex-grow">{routes}</main>
          {!bare && <Footer />}
        </>
      )}
      <Toast />
    </div>
  );
};
