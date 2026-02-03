// Global PWA Install Handler
// This ensures the install prompt is captured even if components mount before it's available

let deferredPrompt = null;
let installPromptListeners = [];

// Listen for the beforeinstallprompt event globally
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA install prompt captured globally!');
    
    // Notify all listeners that prompt is available
    installPromptListeners.forEach(listener => listener(e));
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
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error triggering install:', error);
    deferredPrompt = null;
    throw error;
  }
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

