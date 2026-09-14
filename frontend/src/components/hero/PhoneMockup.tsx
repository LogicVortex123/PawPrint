import React from 'react';
import { Calendar, MapPin, Clock, Home, Bell, MoreHorizontal } from 'lucide-react';
import { PawIcon } from '../common/OrganicDeco';

export const PhoneMockup: React.FC = () => {
  return (
    <div className="relative mx-auto w-[295px] sm:w-[320px] h-[600px] sm:h-[640px] bg-[#111A18] rounded-[52px] p-3 shadow-2xl border-[6px] border-[#223631] select-none">
      
      {/* Dynamic Island / Notch */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#181818] mr-2" />
        <div className="w-7 h-1 rounded-full bg-[#222222]" />
      </div>

      {/* Phone Screen */}
      <div className="relative w-full h-full bg-[#FAFAF6] rounded-[44px] overflow-hidden flex flex-col text-[#243638] font-sans shadow-inner pt-6 pb-2 px-4 justify-between">
        
        {/* Status Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#526461]/80 px-2 pt-1 pb-2">
            <span className="font-bold">9:41</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4z"/>
              </svg>
              <div className="w-4 h-2.5 border border-[#526461] rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-[#243638] rounded-2xs" />
              </div>
            </div>
          </div>

          {/* PawPrint Header inside phone */}
          <div className="flex items-center justify-center gap-1.5 pt-1 pb-3">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-paw-forest/20 shadow-2xs">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-extrabold text-[#245C4A] tracking-tight font-sans">
              PawPrint
            </span>
          </div>

          {/* Greeting */}
          <div className="px-1 mb-3">
            <span className="text-[11px] text-[#526461] font-medium">Good morning,</span>
            <div className="text-sm font-extrabold text-[#243638] flex items-center gap-1">
              <span>Anushka</span>
              <span>🐾</span>
            </div>
          </div>

          {/* Active Pet Card: Bruno Golden Retriever */}
          <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-[#E2EBE5] flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs flex-shrink-0">
                <img src="/dog.jpg" alt="Bruno" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#243638]">Bruno</div>
                <div className="text-[10px] text-[#526461] font-medium">Golden Retriever</div>
                <div className="text-[9px] text-[#526461]/80 font-medium">2 years 4 months</div>
              </div>
            </div>
            <span className="text-[#526461] text-xs pr-1 font-bold">›</span>
          </div>

          {/* Quick Actions label */}
          <div className="px-1 text-[11px] font-bold text-[#243638] mb-2">
            Quick Actions
          </div>

          {/* Quick Actions 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white rounded-xl p-2.5 border border-[#E2EBE5] shadow-2xs flex flex-col items-start gap-1.5 hover:border-[#245C4A]/40 transition-colors">
              <div className="w-6 h-6 rounded-lg bg-[#E2EDE6] text-[#245C4A] flex items-center justify-center">
                <PawIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-[#243638]">Add Record</span>
            </div>

            <div className="bg-white rounded-xl p-2.5 border border-[#E2EBE5] shadow-2xs flex flex-col items-start gap-1.5 hover:border-[#245C4A]/40 transition-colors">
              <div className="w-6 h-6 rounded-lg bg-[#E2EDE6] text-[#245C4A] flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-[#243638]">Book Appointment</span>
            </div>

            <div className="bg-white rounded-xl p-2.5 border border-[#E2EBE5] shadow-2xs flex flex-col items-start gap-1.5 hover:border-[#245C4A]/40 transition-colors">
              <div className="w-6 h-6 rounded-lg bg-[#E2EDE6] text-[#245C4A] flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-[#243638]">Find Clinics</span>
            </div>

            <div className="bg-white rounded-xl p-2.5 border border-[#E2EBE5] shadow-2xs flex flex-col items-start gap-1.5 hover:border-[#245C4A]/40 transition-colors">
              <div className="w-6 h-6 rounded-lg bg-[#E2EDE6] text-[#245C4A] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-[#243638]">View Timeline</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar inside phone */}
        <div>
          <div className="bg-white/95 rounded-2xl px-3 py-2 border border-[#E2EBE5] flex items-center justify-around shadow-xs mb-1">
            <div className="flex flex-col items-center text-[#245C4A]">
              <Home className="w-3.5 h-3.5" />
              <span className="text-[8px] font-bold mt-0.5">Home</span>
            </div>
            <div className="flex flex-col items-center text-[#526461]/70">
              <PawIcon className="w-3.5 h-3.5 text-[#526461]/70" />
              <span className="text-[8px] mt-0.5 font-medium">Pets</span>
            </div>
            <div className="flex flex-col items-center text-[#526461]/70">
              <Bell className="w-3.5 h-3.5" />
              <span className="text-[8px] mt-0.5 font-medium">Reminders</span>
            </div>
            <div className="flex flex-col items-center text-[#526461]/70">
              <MoreHorizontal className="w-3.5 h-3.5" />
              <span className="text-[8px] mt-0.5 font-medium">More</span>
            </div>
          </div>

          {/* Home indicator bar */}
          <div className="w-20 h-1 bg-[#243638]/20 rounded-full mx-auto mt-1" />
        </div>

      </div>
    </div>
  );
};
