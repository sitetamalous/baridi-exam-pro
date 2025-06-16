
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if app is already installed
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppChrome = (window.navigator as any).standalone === true;
    
    if (isInStandalone || isInWebAppChrome) {
      return; // Already installed
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS devices, show banner after a delay
    if (isIOSDevice && !isInWebAppChrome) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember user dismissed the banner
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if user previously dismissed
  if (localStorage.getItem('pwa-banner-dismissed')) {
    return null;
  }

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-algeria-green to-algeria-blue text-white p-4 shadow-lg z-50 animate-slide-in-right">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Download className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              احصل على تجربة أفضل مع التطبيق!
            </p>
            <p className="text-xs opacity-90">
              {isIOS 
                ? 'اضغط على "مشاركة" ثم "إضافة إلى الشاشة الرئيسية"'
                : 'قم بتثبيت التطبيق للوصول السريع والعمل بدون اتصال'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          {!isIOS && deferredPrompt && (
            <Button
              onClick={handleInstallClick}
              size="sm"
              variant="secondary"
              className="bg-white text-algeria-green hover:bg-gray-100"
            >
              تثبيت
            </Button>
          )}
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
