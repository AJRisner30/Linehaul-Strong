import React from 'react';
import { Award, Shield, Truck, Compass, CheckCircle2, AlertTriangle, Dumbbell, Zap } from 'lucide-react';
import { FOUNDER_PROFILE } from '../data/protocols';

interface FounderDoctrineProps {
  onOpenContact?: () => void;
}

export const FounderDoctrine: React.FC<FounderDoctrineProps> = ({ onOpenContact }) => {
  return (
    <div className="space-y-6">
      {/* Hero Founder Header Card */}
      <div className="bg-[#12161D] border-2 border-[#202734] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background Badge Watermark */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 opacity-10 pointer-events-none">
          <img src="/icon.svg" alt="Linehaul Strong Semi-Truck Shield" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#1E2532] to-[#0D1015] border-2 border-[#FF6B00] p-1.5 shadow-xl shadow-[#FF6B00]/25 flex items-center justify-center">
              <img src="/icon.svg" alt="Linehaul Strong" className="w-full h-full object-contain drop-shadow" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded bg-[#FF6B00] text-[#0D0F12] text-[10px] font-tactical font-black uppercase shadow">
              FOUNDER
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 text-xs font-tactical font-bold uppercase">
                FOUNDER & HEAD COACH
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#1D2533] text-slate-300 text-xs font-tactical font-semibold">
                ISSA ELITE TRAINER • CPT • CERTIFIED RUNNING COACH
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white font-heading tracking-wide">
              AJ RISNER
            </h2>
            <p className="text-xs sm:text-sm text-[#FF6B00] font-tactical uppercase tracking-wider mt-0.5 font-semibold">
              Commercial Heavy Haul • Hazmat Linehaul • U.S. Army 88M Motor Transport Veteran
            </p>

            <blockquote className="mt-4 p-4 rounded-xl bg-[#0B0D11] border-l-4 border-[#FF6B00] text-sm sm:text-base text-[#E2E8F0] italic">
              "{FOUNDER_PROFILE.quote}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* The 3 Core Pillars of Operational Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FOUNDER_PROFILE.pillars.map((pillar, idx) => (
          <div key={idx} className="bg-[#12151B] border border-[#222834] rounded-xl p-5 shadow-lg relative">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center font-tactical font-black text-sm mb-3">
              0{idx + 1}
            </div>
            <h3 className="text-base font-bold uppercase text-white font-heading tracking-wider mb-1.5">
              {pillar.title}
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">{pillar.description}</p>
          </div>
        ))}
      </div>

      {/* Field Rig Manual: Zero-Damage Cab Anchoring Protocols */}
      <div className="bg-[#12151B] border border-[#222834] rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-[#1C222C] pb-3 mb-4">
          <Truck className="w-5 h-5 text-[#FF6B00]" />
          <h3 className="text-lg font-bold uppercase tracking-wider text-white font-heading">
            Field Manual: Rig Anchoring & DOT Break Maximization
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#161B23] border border-[#252E3C] space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold uppercase font-heading text-sm">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Approved Rig Anchor Points</span>
            </div>
            <ul className="space-y-2 text-[#CBD5E1]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cab Ingress Grab Handles:</strong> Rated for full 300+ lb bodyweight. Ideal for rows, pull-aparts, and deep counterbalance squats.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Lower Cab Stirrups / Battery Box Steps:</strong> Perfect height for Bulgarian split squats, calf pumps, and hamstring flosses.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Tractor Drive Tire Tread:</strong> Large rubber lugs offer elevated forearm plank platforms that completely eliminate wrist strain.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#161B23] border border-[#252E3C] space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold uppercase font-heading text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Rig Hazards to Strictly Avoid</span>
            </div>
            <ul className="space-y-2 text-[#CBD5E1]">
              <li className="flex items-start gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">X</span>
                <span><strong>Never Anchor to Glad-Hands or Air Lines:</strong> Air brake couplings should never bear mechanical workout loads.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">X</span>
                <span><strong>Avoid Greased Fifth Wheels:</strong> Keep workout gear clear of the trailer kingpin plate and fifth wheel grease bed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">X</span>
                <span><strong>Slippery Diesel Aprons:</strong> Never do dynamic footwork near fuel islands where spilled diesel fuel creates ice-like slickness.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* DOT 30-Minute Break Breakdown */}
        <div className="mt-5 p-4 rounded-xl bg-[#0D1015] border border-[#202836]">
          <span className="text-xs font-tactical uppercase font-bold text-[#FF6B00] block mb-2">
            THE 30-MINUTE DOT BREAK TACTICAL TIMELINE
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs font-tactical">
            <div className="p-2.5 rounded-lg bg-[#141922] border border-[#222A38]">
              <span className="text-[#FF6B00] font-black text-sm block">0 - 5 MIN</span>
              <span className="text-slate-300 font-bold block mt-1">Rig Walk & Tires</span>
              <span className="text-[11px] text-slate-400">Postural decompression, tire check, hydration</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#141922] border border-[#222A38]">
              <span className="text-[#FF6B00] font-black text-sm block">5 - 20 MIN</span>
              <span className="text-slate-300 font-bold block mt-1">Rest Stop Protocol</span>
              <span className="text-[11px] text-slate-400">Execute Day split or 15-min Light DB Flush</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#141922] border border-[#222A38]">
              <span className="text-[#FF6B00] font-black text-sm block">20 - 25 MIN</span>
              <span className="text-slate-300 font-bold block mt-1">Cab Flush Breathing</span>
              <span className="text-[11px] text-slate-400">Box breathing, piriformis flossing, vagus reset</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#141922] border border-[#222A38]">
              <span className="text-[#FF6B00] font-black text-sm block">25 - 30 MIN</span>
              <span className="text-slate-300 font-bold block mt-1">Log & Roll Out</span>
              <span className="text-[11px] text-slate-400">Workout log entry, water refill, pre-trip departure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Contact & Coaching with AJ Risner */}
      <div className="bg-gradient-to-br from-[#181F2C] to-[#10141C] border-2 border-[#FF6B00]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#FF6B00] text-[#0D0F12] text-xs font-tactical font-black uppercase">
                COACHING & QUESTIONS
              </span>
              <span className="text-xs font-tactical text-slate-300">
                DIRECT ACCESS: RISNERATHLETICS@GMAIL.COM
              </span>
            </div>
            <h3 className="text-2xl font-black font-heading uppercase text-white tracking-wide">
              Work 1-on-1 with AJ Risner
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Have questions about your physical road readiness, persistent lower-back pain, or want custom 1-on-1 running programming coached separately for your specific routes and shift schedules? AJ works directly with commercial drivers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onOpenContact && (
              <button
                onClick={onOpenContact}
                className="bg-[#FF6B00] hover:bg-[#E05E00] text-[#0D0F12] font-tactical font-black px-5 py-3 rounded-xl uppercase tracking-wider text-xs shadow-lg shadow-[#FF6B00]/20 transition text-center"
              >
                Open Dispatch Form
              </button>
            )}
            <a
              href="mailto:risnerathletics@gmail.com?subject=[Linehaul Strong] Coaching Inquiry"
              className="bg-[#202734] hover:bg-[#2A3446] text-white border border-[#354358] font-tactical font-semibold px-4 py-3 rounded-xl uppercase tracking-wider text-xs transition text-center"
            >
              Email Directly
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
