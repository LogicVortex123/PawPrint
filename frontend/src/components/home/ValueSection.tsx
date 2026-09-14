import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Calendar, FileText, Syringe, Scale } from 'lucide-react';
import { PawIcon } from '../common/OrganicDeco';

export const ValueSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Large Rounded Container with split green & pale sage background */}
      <div className="relative rounded-[44px] overflow-hidden border border-[#DCEBE2] dark:border-paw-darkborder shadow-soft-xl grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        
        {/* Left Side: Rich Forest Green Gradient with layered depth */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#225746] via-[#1E4E3F] to-[#163B2F] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          
          {/* Translucent background organic circles for depth */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/[0.04] pointer-events-none" />
          <div className="absolute bottom-10 -left-12 w-52 h-52 rounded-full bg-white/[0.03] pointer-events-none" />

          {/* Faint curved decorative line */}
          <svg className="absolute top-1/3 right-0 w-44 h-44 text-white/[0.07] pointer-events-none" viewBox="0 0 100 100" fill="none">
            <path d="M10 90 C30 50, 60 20, 100 10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          {/* Faint paw prints decoration in multiple spots */}
          <div className="absolute bottom-6 right-8 opacity-15 pointer-events-none">
            <PawIcon className="w-28 h-28 text-[#A8C5B3]" />
          </div>
          <div className="absolute top-12 right-6 opacity-10 pointer-events-none">
            <PawIcon className="w-16 h-16 text-[#A8C5B3]" />
          </div>
          <div className="absolute top-1/2 left-6 opacity-10 pointer-events-none">
            <PawIcon className="w-10 h-10 text-[#A8C5B3]" />
          </div>

          <div className="space-y-6 relative z-10">
            {/* Pill label */}
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#A8C5B3]">
              <PawIcon className="w-3.5 h-3.5 text-[#A8C5B3]" />
              <span>MORE THAN JUST AN APP</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-sans">
              A Healthier Tomorrow,<br />
              Together
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#D0E5DA] leading-relaxed font-normal max-w-md">
              With smart tracking, timely reminders and easy access to important information, PawPrint helps you give your pets the care they deserve.
            </p>

            {/* Button */}
            <div className="pt-4">
              <Link
                to="/features"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white border border-white/70 hover:bg-white/15 transition-all duration-200 shadow-sm"
              >
                <span>Explore Features</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Pale Mint/Sage Background with Floating UI Cards & Layered Foliage */}
        <div className="lg:col-span-7 bg-[#E6F0EA] dark:bg-paw-darksurface p-6 sm:p-10 lg:p-12 relative flex flex-col justify-center overflow-hidden">
          
          {/* LAYER 1: Translucent Organic Circles behind cards */}
          <div className="absolute top-[-10%] left-[8%] w-80 h-80 rounded-full bg-[#D4E8DC]/80 dark:bg-paw-darkcard/40 pointer-events-none" />
          <div className="absolute bottom-[-8%] right-[10%] w-72 h-72 rounded-full bg-[#CCE2D5]/70 dark:bg-paw-darkbg/30 pointer-events-none" />
          <div className="absolute top-[35%] right-[32%] w-48 h-48 rounded-full bg-[#B8D7C4]/35 dark:bg-paw-darkcard/20 pointer-events-none" />

          {/* LAYER 2: Botanical Leaves & Branches behind floating cards */}
          {/* Branch 1: Peeking out top-center behind cards */}
          <div className="absolute top-2 right-1/3 opacity-70 pointer-events-none">
            <svg width="130" height="160" viewBox="0 0 130 160" fill="none">
              <path d="M45 155 C48 105, 75 55, 112 12" stroke="#4E816E" strokeWidth="3" strokeLinecap="round" />
              <path d="M52 122 C74 108, 85 118, 80 130 C72 139, 58 132, 52 122 Z" fill="#7EA995" />
              <path d="M64 88 C88 74, 98 85, 92 98 C84 106, 70 99, 64 88 Z" fill="#588874" />
              <path d="M82 52 C104 40, 112 50, 107 60 C100 68, 88 62, 82 52 Z" fill="#7EA995" />
              <path d="M112 12 C122 2, 130 10, 125 20 C118 26, 110 20, 112 12 Z" fill="#588874" />
            </svg>
          </div>

          {/* Branch 2: Peeking out bottom-left behind the weight card */}
          <div className="absolute bottom-2 left-6 opacity-60 pointer-events-none">
            <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
              <path d="M20 115 C35 85, 55 55, 85 25" stroke="#4E816E" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M32 92 C16 85, 12 95, 18 102 C24 108, 32 100, 32 92 Z" fill="#7EA995" />
              <path d="M44 72 C62 62, 68 70, 64 78 C58 84, 50 78, 44 72 Z" fill="#588874" />
              <path d="M60 48 C45 40, 42 50, 48 56 C54 62, 60 55, 60 48 Z" fill="#7EA995" />
            </svg>
          </div>

          {/* LAYER 3: Faint paw-print watermarks on the light side */}
          <div className="absolute bottom-8 right-12 opacity-15 pointer-events-none">
            <PawIcon className="w-14 h-14 text-[#4E816E]" />
          </div>
          <div className="absolute top-8 left-12 opacity-10 pointer-events-none">
            <PawIcon className="w-10 h-10 text-[#4E816E]" />
          </div>

          {/* Delicate curved line accent */}
          <svg className="absolute top-1/4 left-1/4 w-60 h-60 text-[#4E816E]/15 pointer-events-none" viewBox="0 0 120 120" fill="none">
            <path d="M10 110 C20 40, 70 20, 115 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 relative z-10 items-center">
            
            {/* Left Column of Cards: Card 1 (Vaccination) & Card 2 (Weight History) */}
            <div className="sm:col-span-7 space-y-4">
              
              {/* Card 1: Vaccination (Top Left) */}
              <div className="bg-white dark:bg-paw-darkcard rounded-2xl p-4 shadow-sm border border-[#DCEBE2] text-[#243638] dark:text-white transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#EEF6F0]">
                  <div className="w-5 h-5 rounded-full bg-[#E0EDE4] text-[#245C4A] flex items-center justify-center">
                    <Syringe className="w-3 h-3 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-extrabold text-[#243638] dark:text-white">Vaccination</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#243638] dark:text-white">Rabies</div>
                      <div className="text-[10px] text-[#526461]">Next due: 12 Oct 2026</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FEF3C7] text-[#92400E]">
                      Upcoming
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#243638] dark:text-white">DHPP</div>
                      <div className="text-[10px] text-[#526461]">Next due: 20 Nov 2026</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#DEF7EC] text-[#03543F]">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Weight History (Bottom Left) */}
              <div className="bg-white dark:bg-paw-darkcard rounded-2xl p-4 shadow-sm border border-[#DCEBE2] text-[#243638] dark:text-white transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Scale className="w-3 h-3 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-extrabold text-[#243638] dark:text-white">Weight History</span>
                </div>

                {/* SVG Line Chart */}
                <div className="py-1">
                  <svg viewBox="0 0 200 45" className="w-full h-11 overflow-visible">
                    <defs>
                      <linearGradient id="valGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4E816E" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#4E816E" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10 32 Q 40 34, 70 24 T 130 18 T 190 12 L 190 45 L 10 45 Z"
                      fill="url(#valGreenGrad)"
                    />
                    <path
                      d="M 10 32 Q 40 34, 70 24 T 130 18 T 190 12"
                      fill="none"
                      stroke="#4E816E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="190" cy="12" r="3" fill="#4E816E" />
                  </svg>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div>
                    <span className="font-extrabold text-sm text-[#243638] dark:text-white block leading-none">
                      28.5 kg
                    </span>
                    <span className="text-[9px] text-[#526461] font-medium">Latest weight</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-[#03543F] dark:text-emerald-400 block leading-none">
                      +1.2 kg
                    </span>
                    <span className="text-[9px] text-[#526461] font-medium">Since last month</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column of Cards: Card 3 (Health Timeline) + Script Note */}
            <div className="sm:col-span-5 space-y-4">
              
              {/* Card 3: Health Timeline (Right Tall Card) */}
              <div className="bg-white dark:bg-paw-darkcard rounded-2xl p-4 shadow-sm border border-[#DCEBE2] text-[#243638] dark:text-white">
                <div className="text-xs font-extrabold text-[#243638] dark:text-white mb-3 pb-2 border-b border-[#EEF6F0]">
                  Health Timeline
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#E0EDE4] text-[#245C4A] flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="font-bold text-[11px] leading-tight text-[#243638] dark:text-white">Vaccination</div>
                      <div className="text-[9px] text-[#526461]">Rabies · 15 Aug 2026</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#E0EDE4] text-[#245C4A] flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="font-bold text-[11px] leading-tight text-[#243638] dark:text-white">Weight Record</div>
                      <div className="text-[9px] text-[#526461]">28.5 kg · 10 Aug 2026</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#E0EDE4] text-[#245C4A] flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="font-bold text-[11px] leading-tight text-[#243638] dark:text-white">Appointment</div>
                      <div className="text-[9px] text-[#526461]">Vet Visit · 5 Aug 2026</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#E0EDE4] text-[#245C4A] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="font-bold text-[11px] leading-tight text-[#243638] dark:text-white">Document</div>
                      <div className="text-[9px] text-[#526461]">Prescription · 2 Aug 2026</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Handwritten Script Note on the right */}
              <div className="text-center font-script text-[#245C4A] dark:text-paw-warm-sage select-none pt-1">
                <div className="text-xl leading-none font-bold">♡</div>
                <div className="text-lg sm:text-xl font-bold py-0.5">
                  Small steps for their big lives
                </div>
                <div className="text-lg leading-none">🐾</div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
