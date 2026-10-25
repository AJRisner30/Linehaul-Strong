import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  X, 
  Check, 
  Share2, 
  ExternalLink, 
  Copy, 
  WifiOff, 
  ShieldCheck, 
  Zap
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  variant?: 'primary' | 'outline' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  compact = false,
  variant = 'primary'
}) => {
  const { isInstallable, isInstalled, isIOS, install, markAsInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'ios' | 'android' | 'desktop'>(
    isIOS ? 'ios' : 'android'
  );
  const [copied, setCopied] = useState(false);

  // Once the app is downloaded / installed, remove all download UI completely
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = async () => {
    // If the browser provides a direct native install prompt (e.g. Chrome on Android or Desktop)
    if (isInstallable) {
      const success = await install();
      if (success) {
        setShowModal(false);
        return;
      }
      setShowModal(true);
    } else {
      // In iframes, iOS Safari, or browsers awaiting manual home screen add
      setShowModal(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenFullTab = () => {
    window.open(window.location.origin, '_blank');
  };

  return (
    <>
      {variant === 'banner' ? (
        <button
          id="pwa-install-banner-btn"
          onClick={handleButtonClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase transition-all shadow-md shadow-[#FF6B00]/20"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Download App</span>
        </button>
      ) : (
        <button
          id="pwa-install-btn"
          onClick={handleButtonClick}
          className={`flex items-center gap-2 rounded-lg font-tactical font-black tracking-wider uppercase transition-all duration-200 shadow-md ${
            compact
              ? 'px-3 py-1.5 text-xs bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] shadow-[#FF6B00]/20'
              : 'px-4 py-2 text-xs sm:text-sm bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] shadow-[#FF6B00]/25'
          }`}
          title="Download & Install Linehaul Strong on your phone, tablet, or desktop"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download App</span>
          {!compact && (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#0A0D12]/20 text-[10px] font-mono font-bold tracking-tight">
              OFFLINE READY
            </span>
          )}
        </button>
      )}

      {/* Comprehensive Download & Install Guide Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-[#0F131A] border border-[#2B3545] p-5 sm:p-6 shadow-2xl space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#1F2735] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#1C2430] to-[#0A0D12] border border-[#FF6B00]/60 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-[#FF6B00]/20">
                  <img 
                    src="/icon.svg" 
                    alt="Linehaul Strong" 
                    className="w-full h-full object-contain" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white font-heading uppercase tracking-wide">
                      Download Linehaul Strong
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 text-[10px] font-tactical font-bold uppercase">
                      PWA
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-tactical mt-0.5">
                    Direct installation • No App Store or Google Play required
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1D2533] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Offline Rig Benefits Highlights */}
            <div className="grid grid-cols-3 gap-2 bg-[#141A24] border border-[#222C3D] p-3 rounded-xl text-center">
              <div className="space-y-1">
                <WifiOff className="w-4 h-4 text-[#FF6B00] mx-auto" />
                <p className="text-[11px] font-bold text-white uppercase font-tactical">0 Bars Signal</p>
                <p className="text-[10px] text-slate-400 leading-tight">All workouts work offline in dead zones</p>
              </div>
              <div className="space-y-1 border-x border-[#222C3D] px-1">
                <Zap className="w-4 h-4 text-[#FF6B00] mx-auto" />
                <p className="text-[11px] font-bold text-white uppercase font-tactical">Instant Launch</p>
                <p className="text-[10px] text-slate-400 leading-tight">Full-screen icon right on your home screen</p>
              </div>
              <div className="space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#FF6B00] mx-auto" />
                <p className="text-[11px] font-bold text-white uppercase font-tactical">Private Data</p>
                <p className="text-[10px] text-slate-400 leading-tight">Secure local storage on your own device</p>
              </div>
            </div>

            {/* If native install is ready, offer the 1-click button */}
            {isInstallable && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FF6B00]/20 via-[#FF6B00]/10 to-transparent border border-[#FF6B00]/50 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-tactical font-black text-white uppercase">
                    1-Click Direct Install Ready
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Your browser supports instant native installation.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const success = await install();
                    if (success) {
                      setShowModal(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase transition shrink-0 shadow-md"
                >
                  Install Now
                </button>
              </div>
            )}

            {/* Platform Selector Tabs */}
            <div className="space-y-3">
              <div className="flex rounded-xl bg-[#141A24] p-1 border border-[#222C3D]">
                <button
                  onClick={() => setActiveDeviceTab('ios')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-tactical font-bold uppercase rounded-lg transition ${
                    activeDeviceTab === 'ios'
                      ? 'bg-[#FF6B00] text-[#0A0D12] shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhone / iPad</span>
                </button>
                <button
                  onClick={() => setActiveDeviceTab('android')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-tactical font-bold uppercase rounded-lg transition ${
                    activeDeviceTab === 'android'
                      ? 'bg-[#FF6B00] text-[#0A0D12] shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android</span>
                </button>
                <button
                  onClick={() => setActiveDeviceTab('desktop')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-tactical font-bold uppercase rounded-lg transition ${
                    activeDeviceTab === 'desktop'
                      ? 'bg-[#FF6B00] text-[#0A0D12] shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>PC / Mac</span>
                </button>
              </div>

              {/* Step by Step Instructions */}
              <div className="space-y-2.5">
                {activeDeviceTab === 'ios' && (
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-3 bg-[#151C27] p-3 rounded-xl border border-[#243042]">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-[#0A0D12] font-black flex items-center justify-center shrink-0 text-xs font-mono">
                        1
                      </span>
                      <div>
                        <p className="font-semibold text-white">Open in Safari</p>
                        <p className="text-slate-400 mt-0.5">
                          Make sure you are viewing this page in the standard Apple <strong className="text-white">Safari</strong> browser.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[#151C27] p-3 rounded-xl border border-[#243042]">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-[#0A0D12] font-black flex items-center justify-center shrink-0 text-xs font-mono">
                        2
                      </span>
                      <div>
                        <p className="font-semibold text-white">Tap the Share Button</p>
                        <p className="text-slate-400 mt-0.5 flex items-center gap-1">
                          Tap the <Share2 className="w-3.5 h-3.5 text-[#FF6B00] inline" /> <strong className="text-white">Share</strong> icon in the bottom menu bar of Safari.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[#151C27] p-3 rounded-xl border border-[#243042]">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-[#0A0D12] font-black flex items-center justify-center shrink-0 text-xs font-mono">
                        3
                      </span>
                      <div>
                        <p className="font-semibold text-white">Tap "Add to Home Screen"</p>
                        <p className="text-slate-400 mt-0.5">
                          Scroll down the share sheet and select <strong className="text-white">"Add to Home Screen"</strong>, then tap <strong className="text-white">Add</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeDeviceTab === 'android' && (
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-3 bg-[#151C27] p-3 rounded-xl border border-[#243042]">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-[#0A0D12] font-black flex items-center justify-center shrink-0 text-xs font-mono">
                        1
                      </span>
                      <div>
                        <p className="font-semibold text-white">Open in Chrome or Samsung Internet</p>
                        <p className="text-slate-400 mt-0.5">
                          Open the link in Google Chrome or your default Android browser.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[#151C27] p-3 rounded-xl border border-[#243042]">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-[#0A0D12] font-black flex items-center justify-center shrink-0 text-xs font-mono">
                        2
                      </span>
                      <div>
                        <p className="font-semibold text-white">Tap the 3-Dots Menu (⋮)</p>
                        <p className="text-slate-400 mt-0.5">
                          In the top-right corner of Chrome, tap the menu dots.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[#151C27] p-3 rounded-xl border border-[#243042]">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-[#0A0D12] font-black flex items-center justify-center shrink-0 text-xs font-mono">
                        3
                      </span>
                      <div>
                        <p className="font-semibold text-white">Select "Install App" or "Add to Home screen"</p>
                        <p className="text-slate-400 mt-0.5">
                          Tap <strong className="text-white">Install</strong>. The Linehaul Strong truck shield will download directly to your apps menu!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeDeviceTab === 'desktop' && (
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-3 bg-[#151C27] p-3 rounded-xl border border-[#243042]">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-[#0A0D12] font-black flex items-center justify-center shrink-0 text-xs font-mono">
                        1
                      </span>
                      <div>
                        <p className="font-semibold text-white">Look for the Install Icon in the URL Bar</p>
                        <p className="text-slate-400 mt-0.5">
                          In Chrome or Microsoft Edge, look at the right side of the address bar for an <strong className="text-white">Install (computer screen with down arrow)</strong> icon.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[#151C27] p-3 rounded-xl border border-[#243042]">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-[#0A0D12] font-black flex items-center justify-center shrink-0 text-xs font-mono">
                        2
                      </span>
                      <div>
                        <p className="font-semibold text-white">Or Use Browser Menu</p>
                        <p className="text-slate-400 mt-0.5">
                          Click the 3 dots (⋮) &gt; <strong className="text-white">"Cast, save, and share"</strong> &gt; <strong className="text-white">"Install Linehaul Strong"</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Useful Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-[#1F2735]">
              <button
                onClick={handleOpenFullTab}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1C2533] hover:bg-[#253245] text-white text-xs font-tactical font-bold uppercase transition border border-[#2F3E54]"
                title="Open in a standalone browser tab so your browser can trigger the install prompt"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Open in Full Tab to Install</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1C2533] hover:bg-[#253245] text-white text-xs font-tactical font-bold uppercase transition border border-[#2F3E54]"
                title="Copy link to send to your phone"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Link for Phone</span>
                  </>
                )}
              </button>
            </div>

            {/* Already Installed / Downloaded Confirmation */}
            <div className="pt-2 border-t border-[#1F2735]">
              <button
                onClick={() => {
                  markAsInstalled();
                  setShowModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 text-xs font-tactical font-bold uppercase transition"
                title="I have already installed or added Linehaul Strong to my home screen"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>I've Already Added / Downloaded This App</span>
              </button>
            </div>

            {/* Footer notice */}
            <div className="text-center">
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-tactical uppercase tracking-wider text-slate-400 hover:text-white transition py-1"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
