// Google OAuth PWA Helper
// Handles OAuth issues specific to PWA standalone mode

export const isPWAMode = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator.standalone === true);
};

export const checkPopupBlocked = () => {
  // Try to open a test popup to check if popups are blocked
  const testPopup = window.open('', '_blank', 'width=1,height=1');
  if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
    return true;
  }
  testPopup.close();
  return false;
};

export const getOAuthErrorType = (error) => {
  if (!error) return 'unknown';
  
  const errorStr = error.toString().toLowerCase();
  const errorCode = error?.error || error?.code;
  
  if (errorCode === 'popup_closed_by_user' || errorStr.includes('popup closed')) {
    return 'popup_closed';
  }
  
  if (errorCode === 'popup_blocked' || errorStr.includes('popup blocked')) {
    return 'popup_blocked';
  }
  
  if (errorStr.includes('network') || errorStr.includes('connection')) {
    return 'network_error';
  }
  
  if (errorStr.includes('script') || errorStr.includes('load')) {
    return 'script_error';
  }
  
  return 'unknown';
};

export const getOAuthErrorMessage = (error) => {
  const errorType = getOAuthErrorType(error);
  
  switch (errorType) {
    case 'popup_blocked':
      return {
        title: 'Popup Blocked',
        message: 'Please allow popups for this site to sign in with Google.',
        action: isPWAMode() 
          ? 'Try opening the site in your browser instead'
          : 'Check your browser settings'
      };
    
    case 'popup_closed':
      return {
        title: 'Sign-in Cancelled',
        message: 'The sign-in window was closed.',
        action: 'Please try again'
      };
    
    case 'network_error':
      return {
        title: 'Connection Error',
        message: 'Unable to connect to Google. Please check your internet connection.',
        action: 'Try again when connected'
      };
    
    case 'script_error':
      return {
        title: 'Sign-in Unavailable',
        message: 'Google sign-in script failed to load.',
        action: 'Please refresh the page and try again'
      };
    
    default:
      return {
        title: 'Sign-in Failed',
        message: 'Unable to sign in with Google.',
        action: isPWAMode() 
          ? 'Try opening the site in your browser'
          : 'Please try again'
      };
  }
};

