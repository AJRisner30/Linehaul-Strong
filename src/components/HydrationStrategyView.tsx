import React, { useState } from 'react';
import { 
  Droplet, 
  Clock, 
  MapPin, 
  Coffee, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Timer, 
  Zap,
  Info
} from 'lucide-react';

interface HydrationStrategyViewProps {
  onContactCoach?: () => void;
}

export const HydrationStrategyView: React.FC<HydrationStrategyViewProps> = ({
  onContactCoach
}) => {
  // Inputs
  const [driveHours, setDriveHours] = useState<number>(4);
  const [cabTempF, setCabTempF] = useState<number>(72);
  const [driverWeightLbs, setDriverWeightLbs] = useState<number>(220);
  const [caffeineDrinks, setCaffeineDrinks] = useState<number>(2);

  // Calculations
  // Baseline fluid per hour: (Weight in lbs * 0.15 oz) per hour
  // Temp modifier: if temp > 80°F, add +20%
  // Caffeine modifier: each coffee/energy drink acts as mild diuretic, requiring +6 oz water + 1 electrolyte hit
  const baseHourlyOz = Math.round((driverWeightLbs * 0.08));
  const tempMultiplier = cabTempF > 85 ? 1.35 : cabTempF > 78 ? 1.15 : 1.0;
  const caffeineExtraOz = caffeineDrinks * 6;

  const totalCalculatedOz = Math.round((baseHourlyOz * driveHours * tempMultiplier) + caffeineExtraOz);
  const electrolytePacks = Math.max(1, Math.round((totalCalculatedOz / 32) + (caffeineDrinks > 1 ? 1 : 0)));

  // Milestones schedule
  const preLoadOz = Math.min(20, Math.round(totalCalculatedOz * 0.35));
  const remainingOz = totalCalculatedOz - preLoadOz;
  const sipHours = Math.max(1, driveHours - 1); // last hour is cutoff
  const hourlySipOz = Math.round(remainingOz / sipHours);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#181D26] to-[#0F131A] border border-[#273549] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-tactical uppercase tracking-wider mb-1">
              <Droplet className="w-4 h-4 text-sky-400" />
              <span>CELLULAR OSMOLARITY & HIGHWAY FLUID TIMING ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-wide uppercase text-white">
              HYDRATION & <span className="text-[#FF6B00]">BATHROOM STRATEGY CALCULATOR</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl font-tactical mt-1">
              The silent killer of trucker metabolism, kidney health, and energy is intentional dehydration—drivers deliberately starve themselves of water so they don't have to pull 80,000 lbs into an unplanned rest stop. This tool times your fluid and electrolyte intake around your exact planned fuel stops.
            </p>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-xl flex items-center gap-3 shrink-0 self-start lg:self-center">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-tactical uppercase text-slate-400 block">TARGET INTAKE</span>
              <span className="text-base font-mono font-black text-white">{totalCalculatedOz} oz Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route Inputs */}
        <div className="lg:col-span-5 bg-[#121722] border border-[#222E3F] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="pb-3 border-b border-[#1E293B]">
            <span className="text-xs font-tactical font-black uppercase text-slate-400 tracking-wider">
              CONFIGURE YOUR UPCOMING DRIVE LEG
            </span>
          </div>

          {/* Drive Leg Slider */}
          <div className="space-y-1.5 bg-[#0A0D12] p-3.5 rounded-xl border border-[#1A222E]">
            <div className="flex items-center justify-between text-xs font-tactical">
              <span className="text-slate-400 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                DRIVE HOURS TO NEXT FUEL STOP:
              </span>
              <span className="font-mono font-bold text-white text-sm">{driveHours} Hours</span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              step="0.5"
              value={driveHours}
              onChange={e => setDriveHours(parseFloat(e.target.value))}
              className="w-full accent-[#FF6B00] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-tactical">
              <span>2h (120 mi)</span>
              <span>4h (240 mi)</span>
              <span>6h (360 mi)</span>
            </div>
          </div>

          {/* Driver Weight */}
          <div className="space-y-1.5 bg-[#0A0D12] p-3.5 rounded-xl border border-[#1A222E]">
            <div className="flex items-center justify-between text-xs font-tactical">
              <span className="text-slate-400 uppercase">DRIVER BODYWEIGHT:</span>
              <span className="font-mono font-bold text-white text-sm">{driverWeightLbs} LBS</span>
            </div>
            <input
              type="range"
              min="150"
              max="340"
              step="5"
              value={driverWeightLbs}
              onChange={e => setDriverWeightLbs(parseInt(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-tactical">
              <span>150 lbs</span>
              <span>240 lbs</span>
              <span>340 lbs</span>
            </div>
          </div>

          {/* Ambient Temperature */}
          <div className="space-y-1.5 bg-[#0A0D12] p-3.5 rounded-xl border border-[#1A222E]">
            <div className="flex items-center justify-between text-xs font-tactical">
              <span className="text-slate-400 uppercase flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                CAB / OUTSIDE TEMP:
              </span>
              <span className="font-mono font-bold text-white text-sm">{cabTempF}°F</span>
            </div>
            <input
              type="range"
              min="65"
              max="105"
              step="1"
              value={cabTempF}
              onChange={e => setCabTempF(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-tactical">
              <span>68°F (AC Cab)</span>
              <span>85°F (Warm)</span>
              <span>100°F (Summer Tarping)</span>
            </div>
          </div>

          {/* Caffeine Intake */}
          <div className="space-y-1.5 bg-[#0A0D12] p-3.5 rounded-xl border border-[#1A222E]">
            <div className="flex items-center justify-between text-xs font-tactical">
              <span className="text-slate-400 uppercase flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                COFFEES / ENERGY DRINKS:
              </span>
              <span className="font-mono font-bold text-white text-sm">{caffeineDrinks} Servings</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={caffeineDrinks}
              onChange={e => setCaffeineDrinks(parseInt(e.target.value))}
              className="w-full accent-[#FF6B00] cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-tactical block">
              Caffeine accelerates kidney filtration. Requires electrolyte balancing.
            </span>
          </div>
        </div>

        {/* Right Column: Timed Tactical Plan */}
        <div className="lg:col-span-7 bg-[#121722] border border-[#222E3F] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
              <div>
                <span className="text-xs font-tactical font-black uppercase text-[#FF6B00] tracking-wider">
                  FLUID DISPATCH PROTOCOL
                </span>
                <h3 className="text-xl font-heading font-black text-white uppercase tracking-wide mt-0.5">
                  TIMED INTAKE & RESTROOM SYNCHRONIZATION
                </h3>
              </div>

              {/* Total Pills */}
              <div className="flex items-center gap-2">
                <div className="bg-[#0A0D12] px-3 py-1.5 rounded-lg border border-[#1E2838] text-center">
                  <span className="text-[10px] font-tactical text-slate-400 uppercase block">LEG TOTAL</span>
                  <span className="text-base font-mono font-bold text-sky-400">{totalCalculatedOz} oz</span>
                </div>
                <div className="bg-[#0A0D12] px-3 py-1.5 rounded-lg border border-[#1E2838] text-center">
                  <span className="text-[10px] font-tactical text-slate-400 uppercase block">ELECTROLYTES</span>
                  <span className="text-base font-mono font-bold text-[#FF6B00]">{electrolytePacks} Packets</span>
                </div>
              </div>
            </div>

            {/* The Strategy Timeline */}
            <div className="space-y-3 mt-5">
              {/* Step 1: Pre-Load */}
              <div className="p-3.5 rounded-xl bg-[#0D121A] border-l-4 border-sky-500 border-t border-r border-b border-[#1D2736] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tactical font-black text-sky-400 uppercase">
                    PHASE 1: HOUR 0 (AT ROLLOUT) • PRE-LOAD
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-[#16202D] px-2 py-0.5 rounded">
                    {preLoadOz} oz + 1 Electrolyte Packet
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-tactical leading-relaxed">
                  Drink {preLoadOz} oz water with sodium/potassium salts 15 minutes before hitting the Interstate. The sodium binds water into your blood plasma, preventing your bladder from filling immediately.
                </p>
              </div>

              {/* Step 2: Cruising Sips */}
              <div className="p-3.5 rounded-xl bg-[#0D121A] border-l-4 border-emerald-500 border-t border-r border-b border-[#1D2736] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tactical font-black text-emerald-400 uppercase">
                    PHASE 2: HOURS 1 TO {Math.max(1, driveHours - 1)} • CRUISE SIPS
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-[#16202D] px-2 py-0.5 rounded">
                    ~{hourlySipOz} oz per Hour (Micro-Sips)
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-tactical leading-relaxed">
                  Keep a insulated jug in your cup holder. Take small 2-3 oz sips every 20-30 minutes. Do NOT chug. Chugging activates stretch receptors in the stomach, signaling the kidneys to dump water into the bladder.
                </p>
              </div>

              {/* Step 3: THE STRATEGIC CUTOFF (Crucial!) */}
              <div className="p-3.5 rounded-xl bg-[#0D121A] border-l-4 border-[#FF6B00] border-t border-r border-b border-[#1D2736] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tactical font-black text-[#FF6B00] uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    PHASE 3: 45–60 MINS BEFORE REST STOP • FLUID CUTOFF
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-[#16202D] px-2 py-0.5 rounded">
                    0 oz (Cutoff)
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-tactical leading-relaxed">
                  Stop drinking all fluids exactly 45 to 60 minutes before your planned fuel/rest stop exit. This gives your kidneys time to filter the remaining blood volume into your bladder so you arrive at the travel center with a full bladder—eliminating emergency roadside pull-offs!
                </p>
              </div>

              {/* Step 4: Post-Fuel Flush */}
              <div className="p-3.5 rounded-xl bg-[#0D121A] border-l-4 border-blue-400 border-t border-r border-b border-[#1D2736] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tactical font-black text-blue-400 uppercase">
                    PHASE 4: AT TRAVEL CENTER RESTROOM • FLUSH & RE-UP
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-[#16202D] px-2 py-0.5 rounded">
                    16 oz Flush
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-tactical leading-relaxed">
                  Use the restroom, inspect your tires, perform a 6-minute Dock Door Drill, and down 16 oz fresh cold water before climbing back into the cab for the next leg.
                </p>
              </div>
            </div>
          </div>

          {/* Founder Coaching Insight */}
          <div className="p-3.5 bg-[#171F2C] border border-[#27364C] rounded-xl flex items-start gap-2.5 text-xs text-slate-300 font-tactical leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
            <div>
              <strong>AJ Risner's Field Wisdom:</strong> "Pure water without salt passes through your digestive tract in 40 minutes and forces you to hunt for an off-ramp. Adding 500mg of electrolytes (sodium + potassium) retains the water in your muscle tissue, keeps your brain alert, and protects your kidneys from stones."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
