import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bed, 
  Moon, 
  Sun, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Truck, 
  Dumbbell, 
  Flame,
  ArrowRight,
  CheckCircle2,
  Droplet,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Plus,
  Minus,
  Info,
  Timer,
  Zap,
  Sliders,
  Compass
} from 'lucide-react';
import { HosRecoveryState } from '../types';

interface HosRecoveryViewProps {
  onSelectProtocol?: (protocolTitle: string) => void;
  onContactCoach?: () => void;
}

export const HosRecoveryView: React.FC<HosRecoveryViewProps> = ({
  onSelectProtocol,
  onContactCoach
}) => {
  // Default State with DOT Clocks
  const [state, setState] = useState<HosRecoveryState>(() => {
    const saved = localStorage.getItem('linehaul_hos_recovery');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          sleepHours: typeof parsed.sleepHours === 'number' ? parsed.sleepHours : 7.5,
          vibrationDisruption: parsed.vibrationDisruption || 'Engine APU Vibration',
          perceivedFatigue: typeof parsed.perceivedFatigue === 'number' ? parsed.perceivedFatigue : 2,
          hydrationStatus: parsed.hydrationStatus || 'Optimal (Clear/Pale Straw)',
          mobilityStiffness: parsed.mobilityStiffness || 'Loose / Supple',
          driveHoursRemaining: typeof parsed.driveHoursRemaining === 'number' ? parsed.driveHoursRemaining : 8.5,
          shiftHoursRemaining: typeof parsed.shiftHoursRemaining === 'number' ? parsed.shiftHoursRemaining : 11.0,
          cycleHoursLogged: typeof parsed.cycleHoursLogged === 'number' ? parsed.cycleHoursLogged : 42.0,
          breakHoursRemaining: typeof parsed.breakHoursRemaining === 'number' ? parsed.breakHoursRemaining : 5.5,
          berthHoursCompleted: typeof parsed.berthHoursCompleted === 'number' ? parsed.berthHoursCompleted : 8.0,
          currentDutyStatus: parsed.currentDutyStatus || 'Driving'
        };
      } catch (e) {
        console.error('Failed to parse saved HOS recovery state:', e);
      }
    }
    return {
      sleepHours: 7.5,
      vibrationDisruption: 'Engine APU Vibration',
      perceivedFatigue: 2,
      hydrationStatus: 'Optimal (Clear/Pale Straw)',
      mobilityStiffness: 'Loose / Supple',
      driveHoursRemaining: 8.5,
      shiftHoursRemaining: 11.0,
      cycleHoursLogged: 42.0,
      breakHoursRemaining: 5.5,
      berthHoursCompleted: 8.0,
      currentDutyStatus: 'Driving'
    };
  });

  // Live DOT Clock Simulation State
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);
  const [clockSpeed, setClockSpeed] = useState<1 | 60 | 300>(1); // 1 = Realtime, 60 = 1 sec/min, 300 = 1 sec/5 min

  // Persist State to localStorage
  useEffect(() => {
    localStorage.setItem('linehaul_hos_recovery', JSON.stringify(state));
  }, [state]);

  // Live Clock Ticking Effect
  useEffect(() => {
    let timer: any = null;
    if (isClockRunning) {
      timer = setInterval(() => {
        setState((prev) => {
          // Delta hours per tick: (clockSpeed seconds) / 3600
          const deltaHours = clockSpeed / 3600;

          if (prev.currentDutyStatus === 'Driving') {
            const nextDrive = Math.max(0, prev.driveHoursRemaining - deltaHours);
            const nextShift = Math.max(0, prev.shiftHoursRemaining - deltaHours);
            const nextBreak = Math.max(0, (prev.breakHoursRemaining ?? 8) - deltaHours);
            const nextCycle = Math.min(70, prev.cycleHoursLogged + deltaHours);

            return {
              ...prev,
              driveHoursRemaining: Math.round(nextDrive * 100) / 100,
              shiftHoursRemaining: Math.round(nextShift * 100) / 100,
              breakHoursRemaining: Math.round(nextBreak * 100) / 100,
              cycleHoursLogged: Math.round(nextCycle * 100) / 100
            };
          } else if (prev.currentDutyStatus === 'Sleeper Berth' || prev.currentDutyStatus === 'Off Duty') {
            const nextBerth = Math.min(14, (prev.berthHoursCompleted ?? 0) + deltaHours);
            const nextSleep = Math.min(12, prev.sleepHours + deltaHours);

            return {
              ...prev,
              berthHoursCompleted: Math.round(nextBerth * 100) / 100,
              sleepHours: Math.round(nextSleep * 100) / 100
            };
          } else {
            // On Duty (Not Driving)
            const nextShift = Math.max(0, prev.shiftHoursRemaining - deltaHours);
            const nextCycle = Math.min(70, prev.cycleHoursLogged + deltaHours);
            return {
              ...prev,
              shiftHoursRemaining: Math.round(nextShift * 100) / 100,
              cycleHoursLogged: Math.round(nextCycle * 100) / 100
            };
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isClockRunning, clockSpeed]);

  // =========================================================================
  // FUNCTIONAL DOT CLOCK RECOVERY CALCULATION ALGORITHM
  // =========================================================================
  // The DOT clocks directly alter autonomic nervous system readiness:
  // 1. Sleep Berth Duration Baseline (up to 40 pts)
  // 2. Drive Clock Fatigue Drain (0 to -18 pts): Driving 8-11 hours creates spinal compression & neural lag.
  // 3. 14-Hour Shift Duty Drain (0 to -10 pts): Late shift circadian dip.
  // 4. Cumulative 70-Hour Cycle Load Factor (0 to -18 pts): Weekly chronic wear.
  // 5. Sleeper Berth Reset Recharge (+5 bonus if 10h reset completed).
  // 6. 8-Hour Break Window Proximity (Triggers active recovery alert).
  // 7. Environment, Hydration & Stiffness modifiers.
  const recoveryBreakdown = useMemo(() => {
    let sleepPoints = 0;
    // Sleep duration baseline (up to 40 pts)
    if (state.sleepHours >= 7.5) sleepPoints = 40;
    else if (state.sleepHours >= 6.5) sleepPoints = 32;
    else if (state.sleepHours >= 5.5) sleepPoints = 24;
    else if (state.sleepHours >= 4.0) sleepPoints = 14;
    else sleepPoints = 8;

    // Fatigue input (up to 20 pts)
    const fatiguePointsList = [20, 16, 12, 8, 4];
    const fatiguePoints = fatiguePointsList[Math.min(4, Math.max(0, state.perceivedFatigue - 1))];

    // Hydration factor (up to 15 pts)
    let hydrationPoints = 5;
    if (state.hydrationStatus === 'Optimal (Clear/Pale Straw)') hydrationPoints = 15;
    else if (state.hydrationStatus === 'Moderate (Amber)') hydrationPoints = 10;

    // Mobility stiffness (up to 15 pts)
    let mobilityPoints = 4;
    if (state.mobilityStiffness === 'Loose / Supple') mobilityPoints = 15;
    else if (state.mobilityStiffness === 'Moderate Lumbar Tightness') mobilityPoints = 9;

    // Environment penalties
    let vibrationPenalty = 0;
    if (state.vibrationDisruption === 'Engine APU Vibration') vibrationPenalty = -4;
    if (state.vibrationDisruption === 'Reefer Unit Neighbor (-15%)') vibrationPenalty = -12;
    if (state.vibrationDisruption === 'Highway Shoulder Noise (-25%)') vibrationPenalty = -20;

    // -----------------------------------------------------------------------
    // DOT CLOCK IMPACT FACTORS (DIRECTLY PLAYING INTO RECOVERY)
    // -----------------------------------------------------------------------
    // Hours driven so far: 11 - driveHoursRemaining
    const hoursDriven = Math.max(0, 11 - state.driveHoursRemaining);
    let driveClockFatigue = 0;
    if (hoursDriven <= 1.5) {
      driveClockFatigue = 0; // Fresh off break
    } else if (hoursDriven <= 4.0) {
      driveClockFatigue = -3; // Mild road exposure
    } else if (hoursDriven <= 7.0) {
      driveClockFatigue = -7; // Moderate spinal load & pedal foot strain
    } else if (hoursDriven <= 9.5) {
      driveClockFatigue = -12; // Heavy lumbar compression & eye strain
    } else {
      driveClockFatigue = -16; // Max 11h driving limit near violation
    }

    // 14-Hour Shift Duty Window Drain
    // Hours on duty: 14 - shiftHoursRemaining
    const hoursOnDuty = Math.max(0, 14 - state.shiftHoursRemaining);
    let shiftWindowFatigue = 0;
    if (hoursOnDuty <= 4.0) {
      shiftWindowFatigue = 0;
    } else if (hoursOnDuty <= 9.0) {
      shiftWindowFatigue = -3;
    } else if (hoursOnDuty <= 12.0) {
      shiftWindowFatigue = -6;
    } else {
      shiftWindowFatigue = -10; // Late 14h window, circadian dip
    }

    // Cumulative 70-Hour Cycle Factor (Chronic Multi-Day Fatigue)
    let cycleFatigue = 0;
    if (state.cycleHoursLogged <= 30) {
      cycleFatigue = 0; // Early in week
    } else if (state.cycleHoursLogged <= 45) {
      cycleFatigue = -4; // Normal mid-week
    } else if (state.cycleHoursLogged <= 56) {
      cycleFatigue = -8; // Heavy cumulative strain
    } else if (state.cycleHoursLogged <= 64) {
      cycleFatigue = -14; // Approaching 70h cap, CNS fatigue
    } else {
      cycleFatigue = -18; // Critical 70h cycle exhaustion
    }

    // Sleeper Berth Reset Bonus
    let berthResetBonus = 0;
    const berthHours = state.berthHoursCompleted ?? state.sleepHours;
    if (berthHours >= 10.0) {
      berthResetBonus = 6; // Full 10-hour DOT off-duty reset completed
    } else if (berthHours >= 7.0) {
      berthResetBonus = 3; // 7/3 or 8/2 sleeper split break
    }

    // Total Score
    const rawTotal = 
      sleepPoints + 
      fatiguePoints + 
      hydrationPoints + 
      mobilityPoints + 
      vibrationPenalty + 
      driveClockFatigue + 
      shiftWindowFatigue + 
      cycleFatigue + 
      berthResetBonus;

    const finalScore = Math.max(12, Math.min(99, Math.round(rawTotal)));

    return {
      finalScore,
      sleepPoints,
      fatiguePoints,
      hydrationPoints,
      mobilityPoints,
      vibrationPenalty,
      driveClockFatigue,
      shiftWindowFatigue,
      cycleFatigue,
      berthResetBonus,
      hoursDriven: Math.round(hoursDriven * 10) / 10,
      hoursOnDuty: Math.round(hoursOnDuty * 10) / 10
    };
  }, [state]);

  const recoveryScore = recoveryBreakdown.finalScore;

  // Dynamic Tier and AJ Risner Directive that adapts to DOT Clocks
  const tier = useMemo(() => {
    const breakHours = state.breakHoursRemaining ?? 8;
    const isBreakImminent = breakHours <= 0.6; // Within ~35 minutes of 30-min break
    const isShiftEnding = state.driveHoursRemaining <= 1.5 || state.shiftHoursRemaining <= 1.5;
    const isHeavyCycle = state.cycleHoursLogged >= 58;

    if (recoveryScore >= 78) {
      return {
        label: 'PRIME ENGINE READY',
        sub: 'Optimal physical recovery & clear mental acuity • Cleared for full driving shift & high-cadence training',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/15 border-emerald-500/30',
        recommendation: isBreakImminent
          ? 'Physical readiness is optimal. Your 30-minute mandatory DOT break is approaching: execute a 15-minute Light DB Asphalt Flush or brisk cab walk to maintain blood flow.'
          : 'Autonomic nervous system is primed. Cleared for Day 1/Day 2 Rest Stop Protocol or a rigorous session at a gym with nearby truck parking before rolling.',
        actionProtocol: isBreakImminent ? 'Light DB: The 15-Minute Asphalt Flush' : 'Day 1: Upper Body Rig Anchor & Push/Pull'
      };
    } else if (recoveryScore >= 52) {
      return {
        label: 'MODERATE CAB STRAIN',
        sub: `Slight road fatigue (Driven: ${recoveryBreakdown.hoursDriven}h • Cycle: ${state.cycleHoursLogged}h) • Active spinal decompression required`,
        color: 'text-amber-400',
        bg: 'bg-amber-500/15 border-amber-500/30',
        recommendation: isShiftEnding
          ? 'Approaching 11h/14h limits with moderate lumbar wear. Do NOT attempt heavy lifts tonight. Focus on 10-minute sleeper berth spinal decompression and foam rolling once parked.'
          : isHeavyCycle
          ? 'Cumulative 70-hour cycle strain detected. Execute a 10-minute Dock Door Drill or Rest Stop Day 3 leg-flush during your 30-minute break to eliminate heavy leg syndrome.'
          : 'Execute a 15-minute Light DB Asphalt Flush or a 6-minute Dock Door Drill during your DOT stop. Keep heart rate moderate and avoid 1RM loading.',
        actionProtocol: isShiftEnding ? 'Day 4: Active Recovery, Mobility & Core Resilience' : 'Dock Drill: 6-Min Dock-Door Decompression & Power Flush'
      };
    } else {
      return {
        label: 'HIGH ROAD WEAR / ADRENAL CAUTION',
        sub: `Severe nervous fatigue & cumulative DOT strain (Cycle: ${state.cycleHoursLogged}h • Drive Left: ${state.driveHoursRemaining}h) • Prioritize restoration`,
        color: 'text-rose-400',
        bg: 'bg-rose-500/15 border-rose-500/30',
        recommendation: 'Do NOT perform high-intensity interval sprints or heavy compound lifting. Your driving clock and cumulative cycle hours show severe nervous fatigue. Prioritize Day 4 Active Recovery & Sleeper Berth decompression to prevent highway hypnosis.',
        actionProtocol: 'Day 4: Active Recovery, Mobility & Core Resilience'
      };
    }
  }, [recoveryScore, state, recoveryBreakdown]);

  // Fast Adjust Clock Handlers
  const handleAdjustDriveClock = (deltaMin: number) => {
    const deltaHours = deltaMin / 60;
    setState((prev) => ({
      ...prev,
      driveHoursRemaining: Math.max(0, Math.min(11, Math.round((prev.driveHoursRemaining + deltaHours) * 100) / 100))
    }));
  };

  const handleAdjustShiftClock = (deltaMin: number) => {
    const deltaHours = deltaMin / 60;
    setState((prev) => ({
      ...prev,
      shiftHoursRemaining: Math.max(0, Math.min(14, Math.round((prev.shiftHoursRemaining + deltaHours) * 100) / 100))
    }));
  };

  const handleAdjustBreakClock = (deltaMin: number) => {
    const deltaHours = deltaMin / 60;
    setState((prev) => ({
      ...prev,
      breakHoursRemaining: Math.max(0, Math.min(8, Math.round(((prev.breakHoursRemaining ?? 8) + deltaHours) * 100) / 100))
    }));
  };

  const handleAdjustCycleClock = (deltaHours: number) => {
    setState((prev) => ({
      ...prev,
      cycleHoursLogged: Math.max(0, Math.min(70, Math.round((prev.cycleHoursLogged + deltaHours) * 10) / 10))
    }));
  };

  // Preset Handlers
  const applyPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'fresh-11h':
        setState((prev) => ({
          ...prev,
          driveHoursRemaining: 11.0,
          shiftHoursRemaining: 14.0,
          breakHoursRemaining: 8.0,
          cycleHoursLogged: Math.min(prev.cycleHoursLogged, 35.0),
          berthHoursCompleted: 10.0,
          sleepHours: 8.0,
          perceivedFatigue: 1,
          currentDutyStatus: 'Driving'
        }));
        break;
      case 'mid-shift':
        setState((prev) => ({
          ...prev,
          driveHoursRemaining: 5.5,
          shiftHoursRemaining: 8.0,
          breakHoursRemaining: 2.5,
          cycleHoursLogged: 42.0,
          perceivedFatigue: 2,
          currentDutyStatus: 'Driving'
        }));
        break;
      case 'break-due':
        setState((prev) => ({
          ...prev,
          driveHoursRemaining: 3.5,
          shiftHoursRemaining: 6.0,
          breakHoursRemaining: 0.25, // 15 mins left
          cycleHoursLogged: 48.0,
          perceivedFatigue: 3,
          currentDutyStatus: 'Driving'
        }));
        break;
      case 'end-of-shift':
        setState((prev) => ({
          ...prev,
          driveHoursRemaining: 0.75, // 45 mins left
          shiftHoursRemaining: 1.25,
          breakHoursRemaining: 4.0,
          cycleHoursLogged: 56.0,
          perceivedFatigue: 4,
          currentDutyStatus: 'Driving'
        }));
        break;
      case 'heavy-week':
        setState((prev) => ({
          ...prev,
          driveHoursRemaining: 4.0,
          shiftHoursRemaining: 6.5,
          breakHoursRemaining: 3.0,
          cycleHoursLogged: 64.5, // Heavy 70h cycle
          perceivedFatigue: 4,
          currentDutyStatus: 'Driving'
        }));
        break;
      case 'in-sleeper':
        setState((prev) => ({
          ...prev,
          driveHoursRemaining: 11.0,
          shiftHoursRemaining: 14.0,
          breakHoursRemaining: 8.0,
          berthHoursCompleted: 7.5,
          sleepHours: 7.5,
          perceivedFatigue: 2,
          currentDutyStatus: 'Sleeper Berth'
        }));
        break;
      default:
        break;
    }
  };

  // Helper formatting for hours/min: 8.5 -> "08:30"
  const formatHOS = (decimalHours: number): string => {
    const clamped = Math.max(0, decimalHours);
    const hrs = Math.floor(clamped);
    const mins = Math.round((clamped - hrs) * 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#181D26] to-[#0F131A] border border-[#273549] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider">
                DOT CLOCK & RECOVERY SYNERGY
              </span>
              <span className="text-xs font-tactical text-slate-400">Interactive HOS Readiness Calculator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
              FMCSA DOT Clock & Sleeper Recovery Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-tactical leading-relaxed">
              Your Hours of Service clocks directly dictate nervous system strain and physical capacity. Adjust your Drive, Shift, Break, and 70h Cycle clocks below to see your physical recovery score adapt in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#0A0D12] border border-[#252E3E] rounded-xl px-4 py-3 text-center min-w-[140px]">
              <span className="text-[10px] font-tactical text-slate-400 uppercase block tracking-wider">READINESS RATING</span>
              <span className={`text-2xl font-mono font-black ${tier.color}`}>{recoveryScore}%</span>
              <span className="text-[10px] text-slate-500 block font-tactical mt-0.5">{tier.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: FUNCTIONAL DOT HOURS OF SERVICE (HOS) CLOCKS PANEL
          ========================================================================= */}
      <div className="bg-[#121722] border-2 border-[#243144] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Clock Panel Header & Live Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
          <div>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-lg font-heading font-black text-white uppercase tracking-wide">
                Interactive DOT Hours of Service Clocks
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-tactical mt-0.5">
              Change remaining drive hours, shift window, 30-min break clock, or 70-hour cycle to simulate road fatigue.
            </p>
          </div>

          {/* Live Clock Ticking Simulator & Duty Status */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Duty Status Selector */}
            <select
              value={state.currentDutyStatus || 'Driving'}
              onChange={(e) => setState({ ...state, currentDutyStatus: e.target.value as any })}
              className="bg-[#0A0D12] border border-[#2B384B] text-xs font-tactical font-bold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="Driving">🟢 Driving (Linehaul)</option>
              <option value="On Duty (Not Driving)">🟡 On Duty (Dock / Pre-Trip)</option>
              <option value="Sleeper Berth">🛌 Sleeper Berth (Resting)</option>
              <option value="Off Duty">⚪ Off Duty (10h Break)</option>
            </select>

            {/* Live Countdown Toggle */}
            <button
              onClick={() => setIsClockRunning(!isClockRunning)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-tactical font-black uppercase transition ${
                isClockRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-[#0A0D12]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-[#0A0D12]'
              }`}
              title={isClockRunning ? 'Pause live clock' : 'Run live countdown'}
            >
              {isClockRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Clock</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Clock</span>
                </>
              )}
            </button>

            {/* Fast Speed Multiplier Toggle */}
            {isClockRunning && (
              <button
                onClick={() => {
                  setClockSpeed(clockSpeed === 1 ? 60 : clockSpeed === 60 ? 300 : 1);
                }}
                className="px-2.5 py-2 rounded-xl bg-[#1A222E] border border-[#2A374A] text-[11px] font-mono font-bold text-slate-300 hover:text-white"
                title="Simulation speed multiplier"
              >
                {clockSpeed === 1 ? '1x Realtime' : clockSpeed === 60 ? '60x (1s=1m)' : '300x (Fast)'}
              </button>
            )}
          </div>
        </div>

        {/* Quick Shift Presets Bar */}
        <div>
          <span className="text-[10px] font-tactical text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
            QUICK DOT SHIFT PRESETS (CLICK TO SIMULATE)
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'fresh-11h', label: '🛡️ Full 11h Reset Start', desc: 'Fresh 10h sleep, 0h driven' },
              { id: 'mid-shift', label: '🚚 Mid-Shift (5.5h Driven)', desc: 'Halfway through 11h' },
              { id: 'break-due', label: '⏱️ 30-Min Break Approaching', desc: '15m until 8h break due' },
              { id: 'end-of-shift', label: '⚠️ End of 11h/14h Limit', desc: 'High road fatigue' },
              { id: 'heavy-week', label: '⚡ Heavy 64.5h Week', desc: 'Cumulative 70h strain' },
              { id: 'in-sleeper', label: '🛌 Sleeper Berth Rest', desc: 'Active physical recharge' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className="px-3 py-1.5 rounded-xl bg-[#0A0D12] hover:bg-[#18202D] border border-[#232F42] hover:border-[#FF6B00] text-xs font-tactical text-slate-300 hover:text-white transition text-left"
              >
                <span className="font-bold block">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The 4 Functional DOT Clocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ================= CLOCK 1: 11-HOUR DRIVE CLOCK ================= */}
          <div className="bg-[#0A0D12] border-2 border-[#1E2838] rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tactical font-black uppercase text-slate-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                11-HR DRIVE CLOCK
              </span>
              <span className={`text-[10px] font-tactical font-bold px-1.5 py-0.5 rounded ${
                state.driveHoursRemaining <= 1.5 
                  ? 'bg-rose-500/20 text-rose-400' 
                  : state.driveHoursRemaining <= 4 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {state.driveHoursRemaining <= 0 ? 'VIOLATION / ZERO' : `${state.driveHoursRemaining}h LEFT`}
              </span>
            </div>

            {/* Time Display (HH:MM) */}
            <div className="text-center py-1">
              <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight">
                {formatHOS(state.driveHoursRemaining)}
              </span>
              <span className="text-[10px] text-slate-500 block font-tactical mt-0.5">
                Driven: {recoveryBreakdown.hoursDriven}h of 11h
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1C2534] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  state.driveHoursRemaining <= 1.5 ? 'bg-rose-500' : state.driveHoursRemaining <= 4 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (state.driveHoursRemaining / 11) * 100)}%` }}
              />
            </div>

            {/* Direct Slider Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-tactical text-slate-500">
                <span>0h</span>
                <span>Drag to Change</span>
                <span>11h</span>
              </div>
              <input
                type="range"
                min="0"
                max="11"
                step="0.25"
                value={state.driveHoursRemaining}
                onChange={(e) => setState({ ...state, driveHoursRemaining: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Fast Step Buttons */}
            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-[#182230]">
              <button
                onClick={() => handleAdjustDriveClock(-60)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                -1h
              </button>
              <button
                onClick={() => handleAdjustDriveClock(-15)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                -15m
              </button>
              <button
                onClick={() => handleAdjustDriveClock(15)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                +15m
              </button>
              <button
                onClick={() => handleAdjustDriveClock(60)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                +1h
              </button>
            </div>

            {/* Dynamic Recovery Impact Badge */}
            <div className="bg-[#121822] p-2 rounded-lg text-[10px] font-tactical flex items-center justify-between">
              <span className="text-slate-400">Recovery Impact:</span>
              <span className={`font-mono font-bold ${recoveryBreakdown.driveClockFatigue < -7 ? 'text-rose-400' : 'text-slate-200'}`}>
                {recoveryBreakdown.driveClockFatigue} pts
              </span>
            </div>
          </div>

          {/* ================= CLOCK 2: 14-HOUR SHIFT WINDOW ================= */}
          <div className="bg-[#0A0D12] border-2 border-[#1E2838] rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tactical font-black uppercase text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                14-HR SHIFT WINDOW
              </span>
              <span className={`text-[10px] font-tactical font-bold px-1.5 py-0.5 rounded ${
                state.shiftHoursRemaining <= 2.0 
                  ? 'bg-rose-500/20 text-rose-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {state.shiftHoursRemaining <= 0 ? 'WINDOW CLOSED' : `${state.shiftHoursRemaining}h LEFT`}
              </span>
            </div>

            {/* Time Display */}
            <div className="text-center py-1">
              <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-tight">
                {formatHOS(state.shiftHoursRemaining)}
              </span>
              <span className="text-[10px] text-slate-500 block font-tactical mt-0.5">
                On Duty: {recoveryBreakdown.hoursOnDuty}h of 14h Max
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1C2534] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  state.shiftHoursRemaining <= 2 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (state.shiftHoursRemaining / 14) * 100)}%` }}
              />
            </div>

            {/* Direct Slider Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-tactical text-slate-500">
                <span>0h</span>
                <span>Drag to Change</span>
                <span>14h</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="0.25"
                value={state.shiftHoursRemaining}
                onChange={(e) => setState({ ...state, shiftHoursRemaining: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Fast Step Buttons */}
            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-[#182230]">
              <button
                onClick={() => handleAdjustShiftClock(-60)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                -1h
              </button>
              <button
                onClick={() => handleAdjustShiftClock(-15)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                -15m
              </button>
              <button
                onClick={() => handleAdjustShiftClock(15)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                +15m
              </button>
              <button
                onClick={() => handleAdjustShiftClock(60)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                +1h
              </button>
            </div>

            {/* Dynamic Recovery Impact Badge */}
            <div className="bg-[#121822] p-2 rounded-lg text-[10px] font-tactical flex items-center justify-between">
              <span className="text-slate-400">Circadian Drain:</span>
              <span className={`font-mono font-bold ${recoveryBreakdown.shiftWindowFatigue < -5 ? 'text-rose-400' : 'text-slate-200'}`}>
                {recoveryBreakdown.shiftWindowFatigue} pts
              </span>
            </div>
          </div>

          {/* ================= CLOCK 3: 8-HOUR REST BREAK CLOCK ================= */}
          <div className="bg-[#0A0D12] border-2 border-[#1E2838] rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tactical font-black uppercase text-slate-400 flex items-center gap-1.5">
                <CoffeeIcon />
                8-HR REST BREAK
              </span>
              <span className={`text-[10px] font-tactical font-bold px-1.5 py-0.5 rounded ${
                (state.breakHoursRemaining ?? 8) <= 0.5 
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse' 
                  : (state.breakHoursRemaining ?? 8) <= 1.5 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-sky-500/20 text-sky-400'
              }`}>
                {(state.breakHoursRemaining ?? 8) <= 0 ? 'BREAK REQUIRED NOW' : `${state.breakHoursRemaining ?? 8}h UNTIL BREAK`}
              </span>
            </div>

            {/* Time Display */}
            <div className="text-center py-1">
              <span className="text-3xl sm:text-4xl font-mono font-black text-sky-400 tracking-tight">
                {formatHOS(state.breakHoursRemaining ?? 8)}
              </span>
              <span className="text-[10px] text-slate-500 block font-tactical mt-0.5">
                FMCSA 30-Min Rest Rule
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1C2534] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  (state.breakHoursRemaining ?? 8) <= 0.5 ? 'bg-rose-500' : (state.breakHoursRemaining ?? 8) <= 1.5 ? 'bg-amber-500' : 'bg-sky-500'
                }`}
                style={{ width: `${Math.min(100, ((state.breakHoursRemaining ?? 8) / 8) * 100)}%` }}
              />
            </div>

            {/* Direct Slider Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-tactical text-slate-500">
                <span>0h</span>
                <span>Drag to Change</span>
                <span>8h</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.25"
                value={state.breakHoursRemaining ?? 8}
                onChange={(e) => setState({ ...state, breakHoursRemaining: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Fast Step Buttons */}
            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-[#182230]">
              <button
                onClick={() => handleAdjustBreakClock(-60)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                -1h
              </button>
              <button
                onClick={() => handleAdjustBreakClock(-15)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                -15m
              </button>
              <button
                onClick={() => handleAdjustBreakClock(15)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                +15m
              </button>
              <button
                onClick={() => handleAdjustBreakClock(60)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                +1h
              </button>
            </div>

            {/* Tactical Break Status */}
            <div className="bg-[#121822] p-2 rounded-lg text-[10px] font-tactical flex items-center justify-between">
              <span className="text-slate-400">Tactical Window:</span>
              <span className={`font-mono font-bold ${
                (state.breakHoursRemaining ?? 8) <= 0.5 ? 'text-amber-400 font-black' : 'text-slate-300'
              }`}>
                {(state.breakHoursRemaining ?? 8) <= 0.5 ? '⚡ 15m Flush Ready' : 'Highway Transit'}
              </span>
            </div>
          </div>

          {/* ================= CLOCK 4: 70-HOUR / 8-DAY CYCLE ================= */}
          <div className="bg-[#0A0D12] border-2 border-[#1E2838] rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tactical font-black uppercase text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                70-HR / 8-DAY CYCLE
              </span>
              <span className={`text-[10px] font-tactical font-bold px-1.5 py-0.5 rounded ${
                state.cycleHoursLogged >= 62 
                  ? 'bg-rose-500/20 text-rose-400' 
                  : state.cycleHoursLogged >= 50 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {Math.max(0, Math.round((70 - state.cycleHoursLogged) * 10) / 10)}h AVAIL
              </span>
            </div>

            {/* Time Display */}
            <div className="text-center py-1">
              <span className="text-3xl sm:text-4xl font-mono font-black text-purple-400 tracking-tight">
                {state.cycleHoursLogged}h
              </span>
              <span className="text-[10px] text-slate-500 block font-tactical mt-0.5">
                Used of 70.0h FMCSA Limit
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1C2534] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  state.cycleHoursLogged >= 62 ? 'bg-rose-500' : state.cycleHoursLogged >= 50 ? 'bg-amber-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, (state.cycleHoursLogged / 70) * 100)}%` }}
              />
            </div>

            {/* Direct Slider Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-tactical text-slate-500">
                <span>0h</span>
                <span>Drag to Change</span>
                <span>70h</span>
              </div>
              <input
                type="range"
                min="0"
                max="70"
                step="0.5"
                value={state.cycleHoursLogged}
                onChange={(e) => setState({ ...state, cycleHoursLogged: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Fast Step Buttons */}
            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-[#182230]">
              <button
                onClick={() => handleAdjustCycleClock(-5)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                -5h
              </button>
              <button
                onClick={() => handleAdjustCycleClock(-1)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                -1h
              </button>
              <button
                onClick={() => handleAdjustCycleClock(1)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                +1h
              </button>
              <button
                onClick={() => handleAdjustCycleClock(5)}
                className="py-1 rounded bg-[#161D27] hover:bg-[#202A38] text-[10px] font-mono text-slate-300 hover:text-white"
              >
                +5h
              </button>
            </div>

            {/* Dynamic Recovery Impact Badge */}
            <div className="bg-[#121822] p-2 rounded-lg text-[10px] font-tactical flex items-center justify-between">
              <span className="text-slate-400">Chronic Cycle Strain:</span>
              <span className={`font-mono font-bold ${recoveryBreakdown.cycleFatigue < -8 ? 'text-rose-400' : 'text-slate-200'}`}>
                {recoveryBreakdown.cycleFatigue} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: DUAL CARDS - READINESS DIAL & DOT CLOCK FACTOR BREAKDOWN
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recovery Score Dial Card */}
        <div className="lg:col-span-6 bg-[#121722] border border-[#222E3F] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <span className="text-xs font-tactical font-black uppercase text-slate-400 tracking-wider">
                TODAY'S PHYSICAL RECOVERY SCORE
              </span>
              <span className="text-[10px] font-tactical text-[#FF6B00] bg-[#FF6B00]/15 px-2 py-0.5 rounded border border-[#FF6B00]/30 font-bold">
                TACTICAL READINESS FORMULA
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 my-6">
              {/* Circular Dial / Gauge */}
              <div className="relative w-36 h-36 rounded-full bg-[#0A0D12] border-4 border-[#222C3C] flex items-center justify-center shadow-2xl shrink-0">
                <div className="text-center">
                  <span className="text-5xl font-mono font-black text-white">{recoveryScore}</span>
                  <span className="text-xs font-tactical text-slate-400 block uppercase font-bold">/ 100</span>
                </div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent transition-all duration-700"
                  style={{
                    borderColor: recoveryScore >= 78 ? '#10B981' : recoveryScore >= 52 ? '#F59E0B' : '#EF4444',
                    transform: `rotate(${Math.min(360, recoveryScore * 3.6)}deg)`
                  }}
                />
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className={`px-3 py-1 rounded-lg text-xs font-tactical font-black uppercase border inline-block ${tier.bg} ${tier.color}`}>
                  {tier.label}
                </div>
                <p className="text-xs text-slate-300 font-tactical leading-relaxed">
                  {tier.sub}
                </p>
                <div className="text-[11px] font-tactical text-slate-400">
                  Duty Status: <strong className="text-white">{state.currentDutyStatus || 'Driving'}</strong> • Environment: <strong className="text-white">{state.vibrationDisruption}</strong>
                </div>
              </div>
            </div>

            {/* Tactical Protocol Recommendation */}
            <div className="p-4 rounded-xl bg-[#0D121A] border border-[#1E2838] space-y-2">
              <span className="text-[10px] font-tactical uppercase tracking-wider text-[#FF6B00] font-black block">
                AJ RISNER TACTICAL DIRECTIVE:
              </span>
              <p className="text-xs text-slate-200 font-tactical leading-relaxed">
                {tier.recommendation}
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[#19212D]">
                <span className="text-xs font-tactical text-slate-400">Recommended Protocol:</span>
                <button
                  onClick={() => onSelectProtocol && onSelectProtocol(tier.actionProtocol)}
                  className="text-xs font-tactical font-bold text-[#FF6B00] hover:text-white uppercase flex items-center gap-1 transition"
                >
                  <span>{tier.actionProtocol}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1C2636] flex items-center justify-between text-xs font-tactical text-slate-400">
            <span>Berth Sleep: {state.sleepHours}h</span>
            <span className="text-emerald-400 font-bold">
              {(state.berthHoursCompleted ?? state.sleepHours) >= 10 ? 'Full 10h Reset Completed' : 'Shift Active'}
            </span>
          </div>
        </div>

        {/* DOT CLOCK RECOVERY FACTOR BREAKDOWN (THE TRANSPARENT MATH) */}
        <div className="lg:col-span-6 bg-[#121722] border border-[#222E3F] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <span className="text-xs font-tactical font-black uppercase text-slate-400 tracking-wider">
                HOW YOUR DOT CLOCK IMPACTS RECOVERY
              </span>
              <span className="text-[10px] font-tactical text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                REAL-TIME TELEMETRY
              </span>
            </div>

            {/* Live Point Contribution Table */}
            <div className="space-y-2.5 my-4">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0D12] border border-[#1A2330] text-xs font-tactical">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-white font-bold block">Sleeper Berth Rest Duration</span>
                    <span className="text-[10px] text-slate-400">{state.sleepHours}h recorded in bunk</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400">+{recoveryBreakdown.sleepPoints} pts</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0D12] border border-[#1A2330] text-xs font-tactical">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-white font-bold block">11-Hr Drive Clock Fatigue</span>
                    <span className="text-[10px] text-slate-400">
                      {recoveryBreakdown.hoursDriven}h driven ({state.driveHoursRemaining}h remaining)
                    </span>
                  </div>
                </div>
                <span className={`font-mono font-bold ${recoveryBreakdown.driveClockFatigue < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {recoveryBreakdown.driveClockFatigue} pts
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0D12] border border-[#1A2330] text-xs font-tactical">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-white font-bold block">14-Hr Shift Duty Drain</span>
                    <span className="text-[10px] text-slate-400">
                      {recoveryBreakdown.hoursOnDuty}h on duty ({state.shiftHoursRemaining}h remaining)
                    </span>
                  </div>
                </div>
                <span className={`font-mono font-bold ${recoveryBreakdown.shiftWindowFatigue < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {recoveryBreakdown.shiftWindowFatigue} pts
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0D12] border border-[#1A2330] text-xs font-tactical">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-white font-bold block">Cumulative 70-Hr Cycle Load</span>
                    <span className="text-[10px] text-slate-400">{state.cycleHoursLogged}h logged in 8-day rolling window</span>
                  </div>
                </div>
                <span className={`font-mono font-bold ${recoveryBreakdown.cycleFatigue < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {recoveryBreakdown.cycleFatigue} pts
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0D12] border border-[#1A2330] text-xs font-tactical">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-white font-bold block">Hydration & Mobility Condition</span>
                    <span className="text-[10px] text-slate-400">{state.hydrationStatus} • {state.mobilityStiffness}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sky-400">
                  +{recoveryBreakdown.hydrationPoints + recoveryBreakdown.mobilityPoints} pts
                </span>
              </div>

              {recoveryBreakdown.vibrationPenalty < 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0D12] border border-[#1A2330] text-xs font-tactical">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="text-white font-bold block">Lot Vibration & Noise Penalty</span>
                      <span className="text-[10px] text-slate-400">{state.vibrationDisruption}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-rose-400">{recoveryBreakdown.vibrationPenalty} pts</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 p-3 bg-[#171F2C] border-l-4 border-[#FF6B00] rounded-r-xl text-xs text-slate-300 font-tactical leading-relaxed">
            <span className="font-bold text-white block uppercase">HOS / Physical Synergy:</span>
            As you drive and consume your 11-hour clock, lumbar spine load increases while central reaction speed slows down. Reset clocks fully with 10 hours off duty to clear cumulative penalties.
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: SLEEPER BERTH CONDITIONS & BIOLOGICAL MODIFIERS
          ========================================================================= */}
      <div className="bg-[#121722] border border-[#222E3F] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <h3 className="text-base sm:text-lg font-heading font-black text-white uppercase tracking-wider">
            SLEEPER BERTH CONDITIONS & BIOLOGICAL MODIFIERS
          </h3>
          <span className="text-xs font-tactical text-slate-400">Fine-tune physical inputs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Sleep Hours Slider */}
          <div className="bg-[#0A0D12] p-4 rounded-xl border border-[#1A2433] space-y-2">
            <div className="flex items-center justify-between text-xs font-tactical">
              <span className="text-slate-400 uppercase">BERTH SLEEP DURATION</span>
              <span className="font-mono font-bold text-white">{state.sleepHours} Hours</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={state.sleepHours}
              onChange={e => setState({ ...state, sleepHours: parseFloat(e.target.value) })}
              className="w-full accent-[#FF6B00] cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-tactical block">Ideal: 7.5h to 8.5h for cellular repair</span>
          </div>

          {/* Sleep Environment Disruption */}
          <div className="bg-[#0A0D12] p-4 rounded-xl border border-[#1A2433] space-y-2">
            <span className="text-xs font-tactical text-slate-400 uppercase block">LOT VIBRATION FACTOR</span>
            <select
              value={state.vibrationDisruption}
              onChange={e => setState({ ...state, vibrationDisruption: e.target.value as any })}
              className="w-full bg-[#161E29] border border-[#263549] text-xs text-white rounded-lg p-2 focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="Quiet Lot">Quiet Lot (Optimal 100%)</option>
              <option value="Engine APU Vibration">Engine APU Vibration (-4 pts)</option>
              <option value="Reefer Unit Neighbor (-15%)">Reefer Neighbor (-12 pts)</option>
              <option value="Highway Shoulder Noise (-25%)">Interstate Shoulder (-20 pts)</option>
            </select>
            <span className="text-[10px] text-slate-500 font-tactical block">Affects micro-arousals during REM</span>
          </div>

          {/* Perceived Fatigue Level */}
          <div className="bg-[#0A0D12] p-4 rounded-xl border border-[#1A2433] space-y-2">
            <div className="flex items-center justify-between text-xs font-tactical">
              <span className="text-slate-400 uppercase">CENTRAL FATIGUE</span>
              <span className="font-mono font-bold text-[#FF6B00]">{state.perceivedFatigue} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={state.perceivedFatigue}
              onChange={e => setState({ ...state, perceivedFatigue: parseInt(e.target.value) })}
              className="w-full accent-[#FF6B00] cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-tactical block">1 = Fresh • 5 = Exhausted</span>
          </div>

          {/* Hydration Status */}
          <div className="bg-[#0A0D12] p-4 rounded-xl border border-[#1A2433] space-y-2">
            <span className="text-xs font-tactical text-slate-400 uppercase block">HYDRATION STATUS</span>
            <select
              value={state.hydrationStatus}
              onChange={e => setState({ ...state, hydrationStatus: e.target.value as any })}
              className="w-full bg-[#161E29] border border-[#263549] text-xs text-white rounded-lg p-2 focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="Optimal (Clear/Pale Straw)">Optimal (Clear/Pale Straw)</option>
              <option value="Moderate (Amber)">Moderate (Amber)</option>
              <option value="Low / Road Dehydrated">Low / Road Dehydrated</option>
            </select>
            <span className="text-[10px] text-slate-500 font-tactical block">Fluid volume & vascular flush</span>
          </div>
        </div>

        {/* Mobility Stiffness Selector */}
        <div className="pt-2 border-t border-[#1C2636] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-tactical text-slate-300 font-bold uppercase">Spinal & Hip Stiffness:</span>
            <p className="text-[11px] text-slate-400 font-tactical">Pelvic tilt and lumbar tightness from extended driving stints.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'Loose / Supple', label: 'Loose / Supple (+15 pts)' },
              { id: 'Moderate Lumbar Tightness', label: 'Moderate Tightness (+9 pts)' },
              { id: 'High Stiffness / Highway Hypnosis', label: 'High Stiffness (+4 pts)' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setState({ ...state, mobilityStiffness: m.id as any })}
                className={`px-3 py-1.5 rounded-xl text-xs font-tactical font-bold transition border ${
                  state.mobilityStiffness === m.id
                    ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-white'
                    : 'bg-[#0A0D12] border-[#222F42] text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Coffee Icon Component for 8-Hour Rest Break
const CoffeeIcon: React.FC = () => (
  <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);
