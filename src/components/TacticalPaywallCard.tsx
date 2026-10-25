import React, { useState } from 'react';
import { 
  Lock, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Dumbbell, 
  MapPin, 
  Check, 
  Activity, 
  CreditCard, 
  ChevronRight,
  Eye,
  Zap,
  Building2
} from 'lucide-react';
import { MembershipTier } from '../types';

interface TacticalPaywallCardProps {
  feature: 'road-warrior' | 'hub-runner' | 'custom-plan';
  currentTier: MembershipTier;
  onUpgradeToPro: () => void;
  onNavigateToUnlocked: (tab: 'rest-stop' | 'light-db' | 'pricing') => void;
  onOpenFleetContact?: () => void;
}

export const TacticalPaywallCard: React.FC<TacticalPaywallCardProps> = ({
  feature,
  currentTier,
  onUpgradeToPro,
  onNavigateToUnlocked,
  onOpenFleetContact
}) => {
  const [showSneakPeek, setShowSneakPeek] = useState(false);

  const getTierBadgeText = () => {
    if (currentTier === 'starter') return 'ACTIVE: $15 DRIVER STARTER';
    if (currentTier === 'trial') return 'ACTIVE: 14-DAY FREE TRIAL';
    if (currentTier === 'none') return 'ACTIVE: TRIAL EXPIRED';
    return 'TIER RESTRICTED';
  };

  const getFeatureDetails = () => {
    switch (feature) {
      case 'road-warrior':
        return {
          title: 'Road Warrior 3-Day Commercial Gym Split',
          subtitle: 'Heavy compound barbell, dumbbell, and cable protocols (Push / Pull / Legs)',
          badge: 'PRO EXCLUSIVE ($30/MO)',
          icon: Dumbbell,
          description:
            'The Road Warrior Split is built for drivers who pull into truck stops adjacent to Planet Fitness, Anytime Fitness, or local gyms with 53-foot truck staging. It delivers structured progressive overload to build serious armor against long-haul physical decay.',
          unlockedIncludes: [
            'Push Day (Chest, Delts, Triceps) barbell & dumbbell routines',
            'Pull Day (Deadlift, Lat Pulldowns, Biceps) spinal decompression',
            'Leg Day (Squats, Lunges, Calves) knee and hip stabilization',
            'Machine substitute alternates for crowded commercial gyms',
            'Direct integration with the 53\' Semi Parking Gym Locator'
          ],
          sneakPeekTitle: 'Preview of Day 1: Heavy Push Protocol',
          sneakPeekExercises: [
            { name: 'Barbell Flat Bench Press', setsReps: '4 Sets × 6-8 Reps (Heavy)' },
            { name: 'Incline Dumbbell Press', setsReps: '3 Sets × 8-10 Reps' },
            { name: 'Standing Overhead Military Press', setsReps: '3 Sets × 8-10 Reps' },
            { name: 'Cable Rope Tricep Pressdown', setsReps: '3 Sets × 12-15 Reps' },
            { name: 'Dips or Machine Chest Fly', setsReps: '3 Sets × 10-12 Reps' }
          ]
        };
      case 'hub-runner':
        return {
          title: 'Gyms & Truck Parking GPS (53\' Lots)',
          subtitle: 'Verified semi-truck parking & walking corridor routes to 24/7 fitness facilities',
          badge: 'PRO EXCLUSIVE ($30/MO)',
          icon: MapPin,
          description:
            'Never get trapped in a tight commercial strip mall or receive a boot on your tractor. Our GPS locator identifies commercial gyms directly adjacent to verified 53\' trailer staging, legal bobtail spots, and wide-turning corridors along major interstate lines (I-80, I-40, I-75, I-10).',
          unlockedIncludes: [
            'Verified 53\' trailer staging pins at Planet Fitness & Anytime Fitness',
            'Walking distance corridors and safe pedestrian route tracking',
            'Bobtail and tractor-trailer parking spot confirmation notes',
            'One-touch GPS navigation handoff to Google Maps / Truck GPS',
            'Member-curated driver tips on lot security and overnight rules'
          ],
          sneakPeekTitle: 'Corridor Staging Samples',
          sneakPeekExercises: [
            { name: 'Planet Fitness — I-80 Exit 284 (Walcott, IA)', setsReps: '53\' Staging Behind Lot' },
            { name: 'Anytime Fitness — I-75 Exit 62 (Renfro Valley, KY)', setsReps: 'Verified Semi Corridor' },
            { name: 'Planet Fitness — I-40 Exit 286 (Cookeville, TN)', setsReps: 'Adjacent Strip Staging' },
            { name: 'Anytime Fitness — I-10 Exit 85 (Rayne, LA)', setsReps: 'Bobtail & Semi Friendly' }
          ]
        };
      case 'custom-plan':
        return {
          title: '1-on-1 Coach AJ Custom Rig Plan',
          subtitle: 'Bespoke programming personally authored for your exact truck & shift',
          badge: 'PRO EXCLUSIVE ($30/MO)',
          icon: Award,
          description:
            'No cookie-cutter algorithms. Coach AJ Risner (ISSA Elite Trainer) reviews your specific rig cab dimensions, stowed equipment (bands, adjustable DBs, or bodyweight only), driving schedule, and current joint pain to build a personalized monthly directive.',
          unlockedIncludes: [
            'Full driver intake questionnaire & postural biomechanics review',
            'Tailored routine matching your exact sleeper bunk dimensions',
            'Direct coach notes addressing your driver pain points (lower back, knees, neck)',
            'Monthly program progressions and exercise load updates',
            'Direct priority messaging access to Coach AJ Risner'
          ],
          sneakPeekTitle: 'Sample Custom Protocol Blueprint',
          sneakPeekExercises: [
            { name: 'Freightliner Cascadia Lower Back Rescue Sequence', setsReps: 'Bunk Decompression' },
            { name: 'Volvo 860 Cab Band Hypertrophy Circuit', setsReps: '4-Exercise Micro-Routine' },
            { name: 'Hazmat Dedicated Run Shift Alignment Plan', setsReps: 'Post-Drive 15m Reset' }
          ]
        };
    }
  };

  const details = getFeatureDetails();
  const Icon = details.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2">
      {/* Industrial Lock Shield Card */}
      <div className="relative rounded-3xl bg-[#0D1016] border-2 border-[#FF6B00]/70 p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Background Hazard Stripe Accent */}
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-[#FF6B00] via-[#FFAE00] to-[#FF6B00]"></div>

        {/* Ambient Orange Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Header Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202938] pb-5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#FF6B00]/25">
                <Lock className="w-3.5 h-3.5 stroke-[3]" />
                <span>{details.badge}</span>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#1B2433] text-slate-300 text-xs font-tactical font-bold border border-[#2B394E]">
                {getTierBadgeText()}
              </span>
            </div>

            <span className="text-xs font-tactical text-amber-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>RESTRICTED ACCESS</span>
            </span>
          </div>

          {/* Feature Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#222B3A] to-[#121620] border-2 border-[#FF6B00] flex items-center justify-center shrink-0 shadow-xl shadow-[#FF6B00]/20">
              <Icon className="w-8 h-8 text-[#FF6B00]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase text-white tracking-wide">
                {details.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-tactical mt-0.5">
                {details.subtitle}
              </p>
            </div>
          </div>

          {/* Gating Explanation Box */}
          <div className="bg-[#121620] border border-[#222C3C] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#FF6B00] text-xs font-tactical font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Tactical Access Notice</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-tactical">
              {details.description}
            </p>
            <p className="text-xs text-amber-300/90 font-tactical font-bold">
              {feature === 'custom-plan'
                ? '⚡ 1-on-1 Coach AJ custom programming is personally authored for Road Warrior Pro ($30/mo) members. Drivers on the 14-Day Free Trial or Starter tier can train with the Road Warrior gym split or In-Cab protocols.'
                : currentTier === 'starter'
                ? '⚡ The $15 Starter tier is focused on In-Cab & Rest-Stop protocols. Upgrade to Road Warrior Pro ($30/mo) to unlock commercial gym splits and verified 53\' semi parking GPS.'
                : '⚡ Your 14-Day Free Trial has expired. Upgrade to Road Warrior Pro ($30/mo) or renew your trial to access commercial gym splits and 53\' semi parking GPS.'}
            </p>
          </div>

          {/* What's Unlocked in Road Warrior Pro */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-tactical font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF6B00]" />
              <span>What You Unlock Immediately with Road Warrior Pro ($30/mo):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {details.unlockedIncludes.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-[#141923] border border-[#212A38] rounded-xl p-3 text-xs">
                  <div className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-slate-200 font-tactical leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Upgrade & Action Controls */}
          <div className="pt-4 border-t border-[#1F2735] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onUpgradeToPro}
              className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF7E1F] to-[#FF6B00] hover:from-[#FF7E1F] hover:to-[#FF6B00] text-[#0A0D12] text-sm font-tactical font-black uppercase tracking-wider transition-all shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <CreditCard className="w-4 h-4" />
              <span>Unlock Everything with Pro ($30/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateToUnlocked('rest-stop')}
              className="py-3.5 px-5 rounded-xl bg-[#192230] hover:bg-[#232E40] text-slate-200 border border-[#2F3E54] text-xs font-tactical font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4 text-[#FF6B00]" />
              <span>Return to In-Cab Routine</span>
            </button>

            <button
              onClick={() => onNavigateToUnlocked('pricing')}
              className="py-3.5 px-4 rounded-xl bg-[#121620] hover:bg-[#1A212D] text-slate-400 hover:text-white border border-[#222A38] text-xs font-tactical font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
            >
              <span>Compare All Tiers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sneak Peek Protocol Toggle */}
          <div className="pt-2 border-t border-[#1C2330]">
            <button
              onClick={() => setShowSneakPeek(!showSneakPeek)}
              className="text-xs text-slate-400 hover:text-slate-200 font-tactical flex items-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{showSneakPeek ? 'Hide Preview Outline' : `View ${details.sneakPeekTitle}`}</span>
            </button>

            {showSneakPeek && (
              <div className="mt-3 p-4 rounded-xl bg-[#090C10] border border-[#1E2532] space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] font-tactical font-bold text-slate-400 uppercase">
                  <span>{details.sneakPeekTitle}</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>LOCKED CONTENT</span>
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {details.sneakPeekExercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#111620] border border-[#1A212D] text-xs font-tactical">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-300 font-bold">{ex.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{ex.setsReps}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-2">
                  <button
                    onClick={onUpgradeToPro}
                    className="text-xs font-tactical font-bold text-[#FF6B00] hover:underline"
                  >
                    Upgrade to Road Warrior Pro to start this workout →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fleet Discount Notice */}
      <div className="bg-[#10151E] border border-[#222C3A] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-tactical">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-sky-400 shrink-0" />
          <div>
            <span className="text-white font-bold uppercase">Managing a Trucking Fleet?</span>
            <span className="text-slate-400 block">Get fleet-wide volume pricing and turnkey driver wellness tracking for your entire carrier.</span>
          </div>
        </div>
        <button
          onClick={() => onNavigateToUnlocked('pricing')}
          className="shrink-0 px-3.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900/90 text-sky-300 border border-sky-600/50 text-[11px] font-bold uppercase transition"
        >
          Fleet Pricing Details
        </button>
      </div>
    </div>
  );
};
