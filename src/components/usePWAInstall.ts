import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const checkIsAppInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Detect standalone display mode (running as an installed PWA on Android, Desktop, ChromeOS)
  const isStandaloneQuery =
    (window.matchMedia && (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches
    ));

  // 2. Detect iOS Safari standalone mode (Add to Home Screen)
  const isIOSStandalone =
    (window.navigator as unknown as { standalone?: boolean })?.standalone === true;

  // 3. Detect Android Trusted Web Activity (TWA) or Android APK wrapper
  const isAndroidApp =
    typeof document !== 'undefined' &&
    document.referrer &&
    document.referrer.startsWith('android-app://');

  // 4. Detect persistent download/install confirmation stored locally
  let isSavedInstalled = false;
  try {
    isSavedInstalled = localStorage.getItem('linehaul_app_installed') === 'true';
  } catch {
    // ignore localStorage errors
  }

  return Boolean(isStandaloneQuery || isIOSStandalone || isAndroidApp || isSavedInstalled);
};

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsAppInstalled());
  const [isIOS, setIsIOS] = useState(false);

  const markAsInstalled = useCallback(() => {
    try {
      localStorage.setItem('linehaul_app_installed', 'true');
    } catch {
      // ignore
    }
    setIsInstalled(true);
    setDeferredPrompt(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('linehaul-installed-change', { detail: { isInstalled: true } }));
    }
  }, []);

  useEffect(() => {
    // Re-check initial state
    setIsInstalled(checkIsAppInstalled());

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      // If already marked as installed, do not capture prompt or show install UI
      if (checkIsAppInstalled()) {
        return;
      }
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      markAsInstalled();
    };

    const handleCustomInstallChange = () => {
      setIsInstalled(checkIsAppInstalled());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('linehaul-installed-change', handleCustomInstallChange);

    // Also monitor media query changes (e.g. if the user launches standalone window)
    let standaloneMedia: MediaQueryList | null = null;
    let handleMediaChange: ((e: MediaQueryListEvent) => void) | null = null;
    if (window.matchMedia) {
      standaloneMedia = window.matchMedia('(display-mode: standalone)');
      handleMediaChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          markAsInstalled();
        }
      };
      if (standaloneMedia.addEventListener) {
        standaloneMedia.addEventListener('change', handleMediaChange);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('linehaul-installed-change', handleCustomInstallChange);
      if (standaloneMedia && handleMediaChange && standaloneMedia.removeEventListener) {
        standaloneMedia.removeEventListener('change', handleMediaChange);
      }
    };
  }, [markAsInstalled]);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        markAsInstalled();
        return true;
      }
    } catch (err) {
      console.error('Error during PWA installation:', err);
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    isIOS,
    install,
    markAsInstalled,
  };
}
