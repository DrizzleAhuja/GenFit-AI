// Global PWA Install Handler
// This ensures the install prompt is captured even if components mount before it's available

let deferredPrompt = null;
let installPromptListeners = [];
let appInstalledListener = null;

// Listen for the beforeinstallprompt event globally
if (typeof window !== 'undefined') {
  // Listen for install prompt (fires when app can be installed)
  const handleBeforeInstallPrompt = (e) => {
    console.log('🔔 beforeinstallprompt event fired!', e);
    e.preventDefault();
    deferredPrompt = e;
    console.log('✅ PWA install prompt captured globally!', deferredPrompt);
    
    // Clear any stored "dismissed" state since prompt is available again
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pwa-install-dismissed');
      console.log('🗑️ Cleared dismissed state');
    }
    
    // Notify all listeners that prompt is available
    installPromptListeners.forEach(listener => {
      try {
        listener(e);
      } catch (err) {
        console.error('Error in install prompt listener:', err);
      }
    });
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  console.log('👂 Listening for beforeinstallprompt event');

  // Listen for when app is installed
  window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA installed successfully!');
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
  console.log('🚀 triggerInstall called, deferredPrompt:', deferredPrompt);
  
  if (!deferredPrompt) {
    console.warn('⚠️ No install prompt available');
    throw new Error('Install prompt not available');
  }
  
  try {
    console.log('📱 Calling deferredPrompt.prompt()...');
    await deferredPrompt.prompt();
    console.log('✅ Prompt shown, waiting for user choice...');
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log('👤 User choice:', outcome);
    
    // Store dismissal state only if user dismissed (not if they installed)
    if (outcome === 'dismissed' && typeof localStorage !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      console.log('💾 Saved dismissal state');
    } else {
      // Clear dismissed state if user accepted or if prompt was used
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pwa-install-dismissed');
        console.log('🗑️ Cleared dismissal state');
      }
    }
    
    // Only clear the prompt after user makes a choice
    deferredPrompt = null;
    console.log('🧹 Cleared deferredPrompt');
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('❌ Error triggering install:', error);
    // Don't clear prompt on error - it might still be usable
    // deferredPrompt = null;
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
  if (isPWAInstalled()) {
    console.log('🚫 App already installed, not showing prompt');
    return false;
  }
  
  // ALWAYS show if prompt is available (most important)
  if (deferredPrompt) {
    console.log('✅ Prompt available, should show');
    return true;
  }
  
  // Check if user dismissed recently (within last 7 days)
  if (typeof localStorage !== 'undefined') {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      console.log(`⏰ Days since dismissal: ${daysSinceDismissal.toFixed(2)}`);
      // Show again after 7 days OR if prompt becomes available
      if (daysSinceDismissal >= 7) {
        console.log('✅ 7+ days passed, should show again');
        return true;
      }
      // If less than 7 days, still return true if on mobile (they can install manually)
      if (isMobile() || isAndroid()) {
        console.log('📱 Mobile device, should show manual install');
        return true;
      }
      return false;
    }
  }
  
  // Show if on mobile/Android (they can always install manually)
  const shouldShow = isMobile() || isAndroid();
  console.log(`📱 Mobile check: ${shouldShow}`);
  return shouldShow;
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

// Debug function to check install prompt state
export const debugInstallPrompt = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔍 PWA Install Debug Info:');
  console.log('  - deferredPrompt:', deferredPrompt ? 'Available' : 'Not available');
  console.log('  - isPWAInstalled:', isPWAInstalled());
  console.log('  - isAndroid:', isAndroid());
  console.log('  - isIOS:', isIOS());
  console.log('  - isMobile:', isMobile());
  
  if (typeof localStorage !== 'undefined') {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const daysAgo = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      console.log(`  - Dismissed ${daysAgo.toFixed(2)} days ago`);
    } else {
      console.log('  - Never dismissed');
    }
  }
  
  console.log('  - shouldShowInstallPrompt:', shouldShowInstallPrompt());
};

// Function to reset install prompt state (for testing)
export const resetInstallPromptState = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('pwa-install-dismissed');
    console.log('🔄 Reset install prompt state');
  }
};

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  window.debugPWAInstall = debugInstallPrompt;
  window.resetPWAInstall = resetInstallPromptState;
}

