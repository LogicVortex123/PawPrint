import React from 'react';
import { Link } from 'react-router-dom';
import { PawIcon } from './OrganicDeco';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#1A3E34] text-white overflow-hidden pt-12 pb-16 transition-colors duration-200">
      
      {/* Organic Wavy Curve along the top border */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none -translate-y-[98%]">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 text-[#1A3E34]"
        >
          <path
            d="M0,40 C320,80 720,0 1100,50 C1280,75 1380,30 1440,40 L1440,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Subtle floating paw prints in background */}
      <div className="absolute top-6 left-1/4 opacity-10 pointer-events-none">
        <PawIcon className="w-12 h-12 text-[#A8C5B3]" />
      </div>
      <div className="absolute bottom-6 right-1/4 opacity-10 pointer-events-none">
        <PawIcon className="w-16 h-16 text-[#A8C5B3]" />
      </div>
      <div className="absolute top-10 right-1/12 opacity-10 pointer-events-none">
        <PawIcon className="w-10 h-10 text-[#A8C5B3]" />
      </div>
      <div className="absolute bottom-4 left-1/12 opacity-10 pointer-events-none">
        <PawIcon className="w-12 h-12 text-[#A8C5B3]" />
      </div>
      <div className="absolute top-1/2 left-[48%] opacity-8 pointer-events-none">
        <PawIcon className="w-14 h-14 text-[#A8C5B3]" />
      </div>

      {/* Faint Translucent Decorative Shapes */}
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/[0.03] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/[0.03] pointer-events-none" />

      {/* Botanical Leaves on the Right side of Footer */}
      <div className="absolute right-0 bottom-0 opacity-25 pointer-events-none hidden sm:block">
        <svg width="140" height="160" viewBox="0 0 140 160" fill="none">
          <path d="M120 160 C110 110, 85 60, 50 15" stroke="#A8C5B3" strokeWidth="3" strokeLinecap="round" />
          <path d="M102 125 C78 115, 72 126, 80 138 C88 145, 98 136, 102 125 Z" fill="#6F9F89" />
          <path d="M92 95 C114 84, 122 94, 116 106 C110 114, 98 106, 92 95 Z" fill="#A8C5B3" />
          <path d="M78 68 C58 58, 54 68, 62 76 C70 82, 78 74, 78 68 Z" fill="#6F9F89" />
          <path d="M64 42 C82 30, 90 40, 84 48 C78 54, 68 48, 64 42 Z" fill="#A8C5B3" />
          <path d="M50 15 C40 6, 32 14, 38 24 C44 28, 52 24, 50 15 Z" fill="#6F9F89" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-center lg:text-left">
          
          {/* Left Side: Minimalist Dog & Cat Line-art with Heart */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start items-center">
            <svg
              viewBox="0 0 220 160"
              className="w-44 sm:w-52 h-auto text-white/90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Dog line art */}
              <path d="M70 145 C65 100, 70 70, 95 45 C105 35, 120 38, 128 50 C132 56, 128 66, 122 72 C120 85, 122 115, 125 145" />
              <path d="M102 45 C95 55, 90 75, 96 85" />
              {/* Dog ear */}
              <path d="M112 40 C125 32, 135 42, 128 56" />

              {/* Cat line art (sitting next to dog) */}
              <path d="M125 145 C125 110, 130 90, 145 75 C150 70, 160 72, 165 80 C168 85, 165 92, 162 98 C160 110, 162 130, 165 145" />
              {/* Cat ears */}
              <path d="M142 75 L146 62 L152 74" />
              <path d="M158 74 L164 62 L166 76" />

              {/* Cute looping heart outline connecting them */}
              <path
                d="M172 135 C190 135, 205 115, 195 98 C188 88, 175 95, 170 105 C165 95, 152 88, 145 98 C135 115, 150 135, 170 142"
                stroke="#6F9F89"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Center: PawPrint Logo + Slogan + "Get Started →" */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 shadow-sm">
                <img
                  src="/logo.jpeg"
                  alt="PawPrint"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-sans">
                PawPrint
              </span>
            </div>

            <p className="text-xs text-[#A8C5B3] font-medium">
              Care for their health. Keep their memories.
            </p>

            <div className="pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-xs font-bold text-white bg-[#4E816E] hover:bg-[#3E6B5A] shadow-soft transition-all duration-200"
              >
                <span>Get Started</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Right Side: Handwritten Script "Because they're family, ♡" */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
            <div className="font-script text-3xl sm:text-4xl text-white/95 text-center lg:text-right leading-tight">
              <div>Because</div>
              <div className="italic">they’re family,</div>
              <div className="text-2xl text-center lg:text-right pt-0.5 text-white/80">♡</div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
