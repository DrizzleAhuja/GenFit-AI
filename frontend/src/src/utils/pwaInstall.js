// Global PWA Install Handler
// This ensures the install prompt is captured even if components mount before it's available

let deferredPrompt = null;
let installPromptListeners = [];
let appInstalledListener = null;

// Listen for the beforeinstallprompt event globally
if (typeof window !== 'undefined') {
  // Listen for install prompt (fires when app can be installed)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA install prompt captured globally!');
    
    // Clear any stored "dismissed" state since prompt is available again
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pwa-install-dismissed');
    }
    
    // Notify all listeners that prompt is available
    installPromptListeners.forEach(listener => listener(e));
  });

  // Listen for when app is installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully!');
    deferredPrompt = null;
    
    // Clear dismissed state
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pwa-install-dismissed');
    }
    
    // Notify listeners
    if (appInstalledListener) {
      appInstalledListener();
    }
  });
}

export const getInstallPrompt = () => deferredPrompt;

export const setInstallPrompt = (prompt) => {
  deferredPrompt = prompt;
};

export const onInstallPromptAvailable = (callback) => {
  if (deferredPrompt) {
    callback(deferredPrompt);
  } else {
    installPromptListeners.push(callback);
  }
  
  // Return cleanup function
  return () => {
    installPromptListeners = installPromptListeners.filter(l => l !== callback);
  };
};

export const triggerInstall = async () => {
  if (!deferredPrompt) {
    throw new Error('Install prompt not available');
  }
  
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    // Store dismissal state only if user dismissed (not if they installed)
    if (outcome === 'dismissed' && typeof localStorage !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    } else {
      // Clear dismissed state if user accepted or if prompt was used
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }
    
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error triggering install:', error);
    deferredPrompt = null;
    throw error;
  }
};

export const onAppInstalled = (callback) => {
  appInstalledListener = callback;
  return () => {
    appInstalledListener = null;
  };
};

export const shouldShowInstallPrompt = () => {
  if (typeof window === 'undefined') return false;
  
  // Don't show if already installed
  if (isPWAInstalled()) return false;
  
  // Show if prompt is available OR if it's been a while since dismissal
  if (deferredPrompt) return true;
  
  // Check if user dismissed recently (within last 7 days)
  if (typeof localStorage !== 'undefined') {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      return daysSinceDismissal >= 7;
    }
  }
  
  // Show if on mobile/Android (they can always install manually)
  return isMobile() || isAndroid();
};

export const isPWAInstalled = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator.standalone === true);
};

export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android/i.test(userAgent);
};

export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
};

export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
         (window.innerWidth <= 768);
};

