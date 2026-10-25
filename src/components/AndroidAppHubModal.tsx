import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  X, 
  ShieldCheck, 
  WifiOff, 
  Zap,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity,
  CheckCircle2,
  Maximize2,
  Vibrate
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { DriverAccount } from '../types';
import { isAdminUser } from '../lib/coaching';

interface AndroidAppHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDriver?: Omit<DriverAccount, 'passwordHash'> | null;
}

export const AndroidAppHubModal: React.FC<AndroidAppHubModalProps> = ({
  isOpen,
  onClose,
  currentDriver
}) => {
  const { isInstallable, isInstalled, install, markAsInstalled } = usePWAInstall();
  const [deviceGuideTab, setDeviceGuideTab] = useState<'android' | 'ios'>('android');
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const isAdmin = Boolean(currentDriver?.email && isAdminUser(currentDriver.email));

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    try {
      if (isInstallable) {
        const success = await install();
        if (success) {
          onClose();
        }
      } else {
        // Fallback for browsers requiring user to use the browser menu
        markAsInstalled();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const capacitorCommands = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npm run build && npx cap sync android
npx cap open android`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#0D1117] border-2 border-[#FF6B00]/40 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 border-2 border-[#FF6B00] flex items-center justify-center shrink-0 shadow-lg shadow-[#FF6B00]/20">
              <Smartphone className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 text-[10px] font-tactical font-black uppercase">
                  COMMERCIAL DRIVER EDITION
                </span>
                <span className="text-[10px] font-tactical text-slate-400 uppercase font-bold">
                  ANDROID & IN-CAB
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading uppercase text-white tracking-wide">
                Linehaul Strong Mobile App
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#161D27] hover:bg-[#202938] text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Tap Instant Installation */}
        <div className="bg-gradient-to-r from-[#141C28] via-[#10151E] to-[#141C28] border border-[#253245] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-heading flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF6B00]" />
                1-Tap In-Cab App Installation
              </h3>
              <p className="text-xs text-slate-300 font-tactical leading-relaxed mt-1">
                Install Linehaul Strong directly on your Android phone, tablet, or vehicle dash unit. Runs full-screen with zero browser bars and complete offline capability in remote truck corridors.
              </p>
            </div>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              disabled={isInstalling || isInstalled}
              onClick={handleNativeInstall}
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-tactical font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
                isInstalled
                  ? 'bg-emerald-900/60 border border-emerald-500 text-emerald-300 cursor-default'
                  : 'bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] shadow-[#FF6B00]/25'
              }`}
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>App Already Installed on Device</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {isInstalling 
                      ? 'Launching Android Installer...' 
                      : 'Install App on Phone / Home Screen'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Driver In-Cab Advantages */}
        <div className="grid grid-cols-2 gap-2.5 font-tactical text-left">
          <div className="bg-[#121822] border border-[#1E2838] rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span>0-Bars Offline</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              All workouts, timers, and meal guides function 100% offline in dead zones and sleeper bunks.
            </p>
          </div>

          <div className="bg-[#121822] border border-[#1E2838] rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[#FF6B00] text-xs font-bold uppercase">
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span>Fullscreen App</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Zero browser address bars or navigation tabs for distraction-free in-cab and rig operation.
            </p>
          </div>

          <div className="bg-[#121822] border border-[#1E2838] rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase">
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>1-Tap Launch</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Instant access icon right on your phone home screen, app drawer, or dashboard tablet mount.
            </p>
          </div>

          <div className="bg-[#121822] border border-[#1E2838] rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase">
              <Vibrate className="w-3.5 h-3.5 shrink-0" />
              <span>Rumble Haptics</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Tactile vibration pulses alert you during rest countdowns even through loud diesel engine idle.
            </p>
          </div>
        </div>

        {/* Step-by-Step Device Setup Guide */}
        <div className="bg-[#10141C] border border-[#212C3C] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2736] pb-2.5">
            <span className="text-xs font-heading font-black text-white uppercase tracking-wider">
              Installation Instructions
            </span>
            <div className="flex items-center rounded-lg bg-[#161D27] p-0.5 border border-[#263447]">
              <button
                type="button"
                onClick={() => setDeviceGuideTab('android')}
                className={`px-2.5 py-1 text-[11px] font-tactical font-bold uppercase rounded-md transition ${
                  deviceGuideTab === 'android'
                    ? 'bg-[#FF6B00] text-[#0A0D12]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setDeviceGuideTab('ios')}
                className={`px-2.5 py-1 text-[11px] font-tactical font-bold uppercase rounded-md transition ${
                  deviceGuideTab === 'ios'
                    ? 'bg-[#FF6B00] text-[#0A0D12]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                iPhone / iPad
              </button>
            </div>
          </div>

          {deviceGuideTab === 'android' ? (
            <div className="space-y-2 text-xs font-tactical text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1A2330] text-[#FF6B00] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#2E3C4E]">
                  1
                </span>
                <span>Open in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1A2330] text-[#FF6B00] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#2E3C4E]">
                  2
                </span>
                <span>Tap the <strong>three dots (⋮)</strong> menu in the upper corner of your browser.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1A2330] text-[#FF6B00] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#2E3C4E]">
                  3
                </span>
                <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> to install instantly.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs font-tactical text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1A2330] text-[#FF6B00] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#2E3C4E]">
                  1
                </span>
                <span>Open in <strong>Safari</strong> on your iPhone or iPad.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1A2330] text-[#FF6B00] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#2E3C4E]">
                  2
                </span>
                <span>Tap the <strong>Share</strong> button (box with upward arrow) at the bottom.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1A2330] text-[#FF6B00] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#2E3C4E]">
                  3
                </span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Capacitor/CLI Tools - Strictly hidden from regular drivers */}
        {isAdmin && (
          <div className="bg-[#10141C] border border-amber-600/40 rounded-2xl p-4 space-y-3">
            <button
              type="button"
              onClick={() => setShowAdminTools(!showAdminTools)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase font-heading">
                  [Admin Only] Android Studio & Capacitor Tools
                </span>
              </div>
              {showAdminTools ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAdminTools && (
              <div className="space-y-2.5 pt-2 border-t border-[#1F2735] text-xs font-tactical animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Capacitor Android build sequence:
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(capacitorCommands, 'cap')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#18212D] hover:bg-[#222E40] border border-[#2C3B50] text-[10px] text-slate-300 font-bold transition"
                  >
                    {copiedCmd === 'cap' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#080B10] border border-[#1C2534] rounded-xl p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{capacitorCommands}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1C2534] text-xs font-tactical">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Commercial Driver Grade • Safe In-Cab Operation</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#18202C] hover:bg-[#222D3E] text-slate-300 font-bold uppercase transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
