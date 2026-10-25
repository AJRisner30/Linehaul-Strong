import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  X, 
  ShieldCheck, 
  WifiOff, 
  Cpu, 
  Terminal, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface AndroidAppHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppHubModal: React.FC<AndroidAppHubModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isInstallable, isInstalled, install, markAsInstalled } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

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
        // Fallback for browsers that require user to use Chrome menu -> Add to Home screen
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
                  ANDROID NATIVE & PWA
                </span>
                <span className="text-[10px] font-mono text-slate-400">com.linehaulstrong.app</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading uppercase text-white tracking-wide">
                Linehaul Strong Android Hub
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

        {/* 1-Tap Instant Android WebAPK Install */}
        <div className="bg-gradient-to-r from-[#141C28] via-[#10151E] to-[#141C28] border border-[#253245] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-heading flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF6B00]" />
                1-Tap Instant Android Installation
              </h3>
              <p className="text-xs text-slate-300 font-tactical leading-relaxed mt-1">
                Install Linehaul Strong directly on your Android phone, tablet, or vehicle head unit as a standalone application. It installs an authentic WebAPK with its own launcher icon, full-screen viewport, and zero browser bars.
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
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isInstalled 
                  ? 'App Already Installed on Device' 
                  : isInstalling 
                    ? 'Launching Android Installer...' 
                    : 'Install Android App on Phone'}
              </span>
            </button>
          </div>
        </div>

        {/* Android Native Specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-tactical">
          <div className="bg-[#121822] border border-[#1E2838] rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Min SDK</span>
            <span className="text-sm font-mono font-bold text-white">API 24+</span>
            <span className="text-[9px] text-slate-500 block">Android 7.0+</span>
          </div>

          <div className="bg-[#121822] border border-[#1E2838] rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Target SDK</span>
            <span className="text-sm font-mono font-bold text-[#FF6B00]">API 34</span>
            <span className="text-[9px] text-slate-500 block">Android 14</span>
          </div>

          <div className="bg-[#121822] border border-[#1E2838] rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Offline Mode</span>
            <span className="text-sm font-mono font-bold text-emerald-400">100%</span>
            <span className="text-[9px] text-slate-500 block">0-Bars Bunk Sync</span>
          </div>

          <div className="bg-[#121822] border border-[#1E2838] rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Sensors</span>
            <span className="text-sm font-mono font-bold text-white">GPS + Haptics</span>
            <span className="text-[9px] text-slate-500 block">Vibration API</span>
          </div>
        </div>

        {/* Capacitor & Android Studio APK Build Instructions */}
        <div className="bg-[#10141C] border border-[#212C3C] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase font-heading">
                Build Android Studio .APK / .AAB Project
              </h4>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(capacitorCommands, 'cap')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18212D] hover:bg-[#222E40] border border-[#2C3B50] text-[10px] text-slate-300 font-tactical uppercase font-bold transition"
            >
              {copiedCmd === 'cap' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Commands</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-tactical leading-relaxed">
            A complete <code className="text-[#FF6B00] bg-[#18202A] px-1 py-0.5 rounded font-mono">capacitor.config.json</code> has been generated in the project root. Run these commands in terminal to produce an Android Studio project for release build or Google Play deployment:
          </p>

          <pre className="bg-[#080B10] border border-[#1C2534] rounded-xl p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{capacitorCommands}
          </pre>
        </div>

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
