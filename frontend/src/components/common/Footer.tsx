import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { PawIcon, CatDogLineArt } from './OrganicDeco';

const GITHUB_URL = 'https://github.com/LogicVortex123/PawPrint';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const exploreLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'About', path: '/about' },
    { label: 'Roadmap', path: '/roadmap' },
  ];

  const accountLinks = [
    { label: 'Analytics', path: '/analytics' },
    { label: 'Login', path: '/login' },
    { label: 'Sign Up', path: '/signup' },
  ];

  return (
    <footer className="relative bg-[#1A3E34] text-white overflow-hidden pt-16 pb-8 transition-colors duration-200">

      {/* Organic wavy top border, matching the hill silhouettes used elsewhere on the site */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none -translate-y-[98%]">
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-12 sm:h-16 text-[#1A3E34]">
          <path d="M0,40 C320,80 720,0 1100,50 C1280,75 1380,30 1440,40 L1440,80 L0,80 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Faint floating paw prints — kept as background texture, not competing with real content */}
      <div className="absolute top-10 left-[8%] opacity-[0.06] pointer-events-none"><PawIcon className="w-16 h-16 text-[#A8C5B3]" /></div>
      <div className="absolute bottom-16 right-[6%] opacity-[0.06] pointer-events-none"><PawIcon className="w-20 h-20 text-[#A8C5B3]" /></div>
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/[0.03] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Main grid: brand + description on the left, real navigation links on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">

          {/* Brand column */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 shadow-sm group-hover:scale-105 transition-transform">
                <img src="/logo.jpeg" alt="PawPrint" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-sans">PawPrint</span>
            </Link>

            <p className="text-sm text-[#C9DFD2] leading-relaxed max-w-sm">
              Offline-first pet care &amp; health tracking. Care for their health, keep their memories — even without an internet connection.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>View on GitHub</span>
              </a>
            </div>

            {/* Minimalist dog & cat line-art, kept as a distinctive signature touch */}
            <div className="pt-2 opacity-80">
              <CatDogLineArt className="w-32 sm:w-36 h-auto text-white/70" />
            </div>
          </div>

          {/* Explore links */}
          <div className="lg:col-span-3 lg:col-start-7">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8AB29E] mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-[#D0E5DA] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8AB29E] mb-4">Account</h3>
            <ul className="space-y-2.5">
              {accountLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-[#D0E5DA] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#8AB29E]">© {year} PawPrint. Built for pet parents everywhere.</span>
          <div className="font-script text-xl text-white/85 flex items-center gap-1.5">
            <span>Because they're family</span>
            <span className="text-base">♡</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
