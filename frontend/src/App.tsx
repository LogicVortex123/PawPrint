import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { About } from './pages/About';
import { Roadmap } from './pages/Roadmap';
import { Analytics } from './pages/Analytics';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { useAppStore } from './store/useAppStore';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Wraps any route that requires the user to be logged in.
// If they're not authenticated, they get sent to /login with a
// redirect param so we can bounce them back after they sign in.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  const { pathname } = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(pathname)}`} replace />;
  }

  return <>{children}</>;
}

export const App: React.FC = () => {
  const { theme, isAuthenticated, fetchPets } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Covers a page refresh: the login/signup/googleLogin actions already fetch
  // pets at the moment of logging in, but a session restored from a stored
  // token on reload never runs those, so it needs its own fetch here.
  useEffect(() => {
    if (isAuthenticated) {
      fetchPets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-paw-cream dark:bg-paw-darkbg text-paw-dark dark:text-white transition-colors duration-200">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/features"
            element={
              <ProtectedRoute>
                <Features />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </div>
  );
};
