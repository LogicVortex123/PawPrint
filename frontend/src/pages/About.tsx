import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PawIcon, BotanicalLeaf, HandDrawnHeart } from '../components/common/OrganicDeco';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="py-12 lg:py-24 transition-colors duration-200 relative overflow-hidden">
      {/* Background organic curves */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#E5EFE8] dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-16 right-10 w-80 h-80 bg-[#DCEBE2]/50 dark:bg-paw-darkcard/20 organic-blob-2 blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* About Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E2EDE6] dark:bg-paw-darksurface border border-[#D0E2D5] dark:border-paw-darkborder text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-warm-sage">
            <HandDrawnHeart className="w-4 h-4 text-rose-400" />
            <span>Our Purpose & Origin</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-paw-dark dark:text-white tracking-tight leading-tight">
            Built from the heart,<br />
            <span className="font-script text-5xl sm:text-7xl lg:text-8xl text-paw-forest dark:text-paw-warm-sage">
              because they’re family.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-paw-secondary dark:text-paw-warm-sage/80 pt-2 leading-relaxed">
            PawPrint was born from a simple realization: our pets give us unconditional love every single day. Managing their health and care should feel just as loving, organized, and reliable.
          </p>
        </div>

        {/* Visual Hero Banner with Dog & Cat portraits */}
        <div className="relative rounded-[40px] bg-gradient-to-br from-paw-light-sage/60 via-paw-cream to-paw-soft-sage/40 dark:from-paw-darksurface dark:to-paw-darkbg p-8 sm:p-14 border border-paw-soft-sage/60 dark:border-paw-darkborder overflow-hidden shadow-soft-xl">
          <div className="absolute top-4 right-4 pointer-events-none opacity-20">
            <BotanicalLeaf className="w-48 h-48 text-paw-forest" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-paw-forest dark:text-paw-sage">
                Why PawPrint Exists
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-paw-dark dark:text-white leading-tight">
                No more wrinkled clinic papers, missed boosters, or emergency panic.
              </h2>
              <p className="text-sm sm:text-base text-paw-secondary dark:text-paw-warm-sage/80 leading-relaxed">
                Whether you’re rushing into an emergency clinic at midnight, checking into a boarding hotel, or on a remote trail hike, you should never have to scramble for vaccine proofs or wonder what medication your dog is taking.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-paw-forest dark:text-paw-light-sage bg-white dark:bg-paw-darkcard px-4 py-2 rounded-full border border-paw-soft-sage shadow-sm">
                  <span>🐕 Multi-Pet Homes</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-paw-forest dark:text-paw-light-sage bg-white dark:bg-paw-darkcard px-4 py-2 rounded-full border border-paw-soft-sage shadow-sm">
                  <span>📶 Offline Reliability</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-paw-forest dark:text-paw-light-sage bg-white dark:bg-paw-darkcard px-4 py-2 rounded-full border border-paw-soft-sage shadow-sm">
                  <span>🚨 1-Tap SOS Access</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center items-center gap-4">
              <div className="space-y-4">
                <div className="w-40 sm:w-48 h-48 sm:h-56 rounded-3xl overflow-hidden shadow-soft-lg border-4 border-white dark:border-paw-darksurface transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img src="/dog.jpg" alt="Golden Retriever" className="w-full h-full object-cover" />
                </div>
                <div className="text-center font-script text-xl text-paw-forest dark:text-paw-warm-sage">
                  Luna · Chief Joy Officer
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="w-36 sm:w-44 h-44 sm:h-52 rounded-3xl overflow-hidden shadow-soft-lg border-4 border-white dark:border-paw-darksurface transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img src="/cat.jpg" alt="Tabby Cat" className="w-full h-full object-cover" />
                </div>
                <div className="text-center font-script text-xl text-paw-forest dark:text-paw-warm-sage">
                  Milo · Head of Naps
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Problem vs Our Approach */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="bg-rose-50/70 dark:bg-rose-950/20 rounded-[32px] p-8 sm:p-10 border border-rose-200/60 dark:border-rose-900/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <h3 className="text-2xl font-extrabold text-paw-dark dark:text-white">
              The Reality Pet Parents Face
            </h3>
            <ul className="space-y-3 text-sm text-paw-secondary dark:text-rose-200/80">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Vaccination certificates lost in bottom drawers or old email threads.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Vet apps that crash or lock you out when cellular signal drops inside clinic exam rooms.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Subtle weight fluctuations going unnoticed until medical problems arise.</span>
              </li>
            </ul>
          </div>

          {/* Approach Card */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-[32px] p-8 sm:p-10 border border-emerald-200/60 dark:border-emerald-900/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-paw-dark dark:text-white">
              The PawPrint Approach
            </h3>
            <ul className="space-y-3 text-sm text-paw-secondary dark:text-emerald-200/80">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Offline-first architecture stores everything on your device first.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Automatic smart categorization (Completed, Upcoming, Overdue) keeps you prepared.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Designed with warmth, soothing sage tones, and zero corporate clutter.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Offline-First Philosophy Section */}
        <div className="bg-paw-forest text-white rounded-[36px] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-soft-xl">
          <div className="absolute -bottom-10 -right-10 opacity-20 pointer-events-none">
            <PawIcon className="w-56 h-56 text-paw-warm-sage" />
          </div>

          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-paw-warm-sage bg-paw-deep/70 px-3.5 py-1 rounded-full border border-paw-sage/30">
              Core Engineering Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Why We Insist on Offline-First
            </h2>
            <p className="text-base sm:text-lg text-paw-soft-sage/90 leading-relaxed">
              When an animal is unwell, stress is already high. You should never see a loading spinner or an “offline error” screen when an emergency vet asks for your dog’s vaccine history or allergy list.
            </p>
            <p className="text-sm sm:text-base text-paw-soft-sage/80 leading-relaxed">
              By caching full pet dossiers locally in high-speed SQLite, PawPrint gives you immediate access at all times. When internet connectivity returns, local changes synchronize silently in the background.
            </p>
          </div>
        </div>

        {/* Future Vision */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-paw-forest dark:text-paw-sage">
            Looking Ahead
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-paw-dark dark:text-white">
            Our Vision for Modern Pet Parenting
          </h2>
          <p className="text-base text-paw-secondary dark:text-paw-warm-sage/80 leading-relaxed">
            We are building toward shared family co-parenting, veterinarian verification links, and non-diagnostic wellness insights — all while fiercely guarding your data privacy.
          </p>
          <div className="pt-4">
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-paw-forest text-white hover:bg-paw-deep shadow-soft-lg hover:shadow-soft-xl transition-all"
            >
              <span>Explore Product Roadmap</span>
              <span>→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
