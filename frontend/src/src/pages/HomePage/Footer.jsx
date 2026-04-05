import React, { useState, useEffect } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaMapMarkerAlt,
  FaApple,
  FaAndroid,
  FaDesktop,
  FaProjectDiagram,
  FaTasks,
  FaQuestionCircle,
  FaFileContract,
  FaChartLine,
  FaFileAlt,
  FaShieldAlt,
  FaLock
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext'; // Corrected Import useTheme path
import GenFitLogo from "../../Components/GenFitLogo";
import { toast } from 'react-toastify';
import { 
  getInstallPrompt, 
  onInstallPromptAvailable, 
  triggerInstall, 
  isPWAInstalled, 
  isAndroid, 
  isIOS, 
  isMobile,
  shouldShowInstallPrompt
} from '../../utils/pwaInstall';

export default function Footer() {
  const { darkMode } = useTheme();
  const [hasInstallPrompt, setHasInstallPrompt] = useState(false);
  const [shouldShowInstall, setShouldShowInstall] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isStandalone: false
  });

  useEffect(() => {
    // Function to update device info and install prompt state
    const updateInstallState = () => {
      const isStandalone = isPWAInstalled();
      const deviceInfoUpdate = {
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        isMobile: isMobile(),
        isStandalone: isStandalone
      };
      
      setDeviceInfo(deviceInfoUpdate);
      
      // Show install options if:
      // 1. Not installed AND (has prompt OR should show based on dismissal state)
      if (!isStandalone) {
        const prompt = getInstallPrompt();
        const shouldShow = shouldShowInstallPrompt();
        console.log('🔄 Updating install state:', { 
          hasPrompt: !!prompt, 
          shouldShow, 
          isStandalone 
        });
        setHasInstallPrompt(!!prompt);
        setShouldShowInstall(shouldShow);
      } else {
        console.log('🚫 App is installed, hiding install options');
        setHasInstallPrompt(false);
        setShouldShowInstall(false);
      }
    };

    // Initial check
    updateInstallState();

    // Check if install prompt is already available
    if (getInstallPrompt()) {
      setHasInstallPrompt(true);
    }

    // Listen for when install prompt becomes available
    const cleanupPrompt = onInstallPromptAvailable((prompt) => {
      console.log('🎉 Install prompt became available in Footer!', prompt);
      setHasInstallPrompt(true);
      setShouldShowInstall(true);
    });

    // Listen for app installation
    const cleanupInstalled = window.addEventListener('appinstalled', () => {
      updateInstallState();
    });

    // Periodically check install state (in case app was uninstalled)
    const checkInterval = setInterval(() => {
      updateInstallState();
    }, 2000); // Check every 2 seconds

    // Also check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateInstallState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanupPrompt();
      clearInterval(checkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (cleanupInstalled) {
        window.removeEventListener('appinstalled', cleanupInstalled);
      }
    };
  }, []);

  const handleAndroidInstall = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔘 Install button clicked');
    
    if (deviceInfo.isStandalone) {
      toast.info('App is already installed!', { autoClose: 2000 });
      return;
    }

    // Try to get the install prompt - check multiple times as it might not be immediately available
    let prompt = getInstallPrompt();
    console.log('📦 Initial prompt check:', prompt ? 'Available' : 'Not available');
    
    // If no prompt, wait a bit and check again (sometimes it takes a moment)
    if (!prompt) {
      console.log('⏳ Waiting for prompt...');
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        prompt = getInstallPrompt();
        if (prompt) {
          console.log(`✅ Prompt found after ${(i + 1) * 200}ms`);
          break;
        }
      }
    }
    
    if (prompt) {
      try {
        console.log('✅ Prompt available, triggering install...');
        // Trigger the install prompt immediately
        const accepted = await triggerInstall();
        
        if (accepted) {
          toast.success('Installing GenFit AI...', { autoClose: 2000 });
        } else {
          toast.info('Installation cancelled', { autoClose: 2000 });
        }
        // Update state after prompt is used
        setTimeout(() => {
          const newPrompt = getInstallPrompt();
          console.log('🔄 Checking for new prompt after use:', newPrompt ? 'Available' : 'Not available');
          setHasInstallPrompt(!!newPrompt);
          setShouldShowInstall(shouldShowInstallPrompt());
        }, 1000);
      } catch (error) {
        console.error('❌ Error showing install prompt:', error);
        console.error('Error details:', error.message, error.stack);
        // Show manual instructions as fallback
        showManualInstallInstructions();
      }
    } else {
      console.log('⚠️ No prompt available after waiting, showing manual instructions');
      // If no prompt available, show manual instructions
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    if (deviceInfo.isAndroid) {
      toast.info(
        'Android: Tap menu (⋮) → "Install app" or "Add to Home screen"',
        { autoClose: 6000 }
      );
    } else if (deviceInfo.isIOS) {
      toast.info(
        'iOS: Tap Share button → "Add to Home Screen"',
        { autoClose: 6000 }
      );
    } else {
      toast.info(
        'Desktop: Click menu (⋮) → "Install GenFit AI"',
        { autoClose: 6000 }
      );
    }
  };

  const handleIOSInstall = (e) => {
    e.preventDefault();
    if (deviceInfo.isStandalone) {
      toast.info('App is already installed!', { autoClose: 2000 });
      return;
    }
    toast.info(
      'To install: Tap the Share button, then "Add to Home Screen"',
      { autoClose: 5000 }
    );
  };

  const handleDesktopInstall = async (e) => {
    e.preventDefault();
    if (deviceInfo.isStandalone) {
      toast.info('App is already installed!', { autoClose: 2000 });
      return;
    }
    // Desktop install works the same way
    await handleAndroidInstall(e);
  };

  const footerLinks = {
    "Download & Projects": [
      { 
        icon: <FaAndroid className="mr-2" />, 
        label: "Android App", 
        href: "#",
        onClick: handleAndroidInstall,
        show: !deviceInfo.isStandalone && (deviceInfo.isAndroid || deviceInfo.isMobile)
      },
      { 
        icon: <FaApple className="mr-2" />, 
        label: "iOS App", 
        href: "#",
        onClick: handleIOSInstall,
        show: !deviceInfo.isStandalone && deviceInfo.isIOS
      },
      { 
        icon: <FaDesktop className="mr-2" />, 
        label: "Desktop", 
        href: "#",
        onClick: handleDesktopInstall,
        show: !deviceInfo.isStandalone && !deviceInfo.isMobile
      },
      { icon: <FaProjectDiagram className="mr-2" />, label: "Projects", href: "#" },
      { icon: <FaTasks className="mr-2" />, label: "My Tasks", href: "#" }
    ],
    "Help & Documentation": [
      { icon: <FaQuestionCircle className="mr-2" />, label: "FAQ", href: "#" },
      { icon: <FaQuestionCircle className="mr-2" />, label: "Feedback", href: "/Feedback", isNavLink: true },
      { icon: <FaQuestionCircle className="mr-2" />, label: "Support", href: "/Support", isNavLink: true },



      { icon: <FaFileContract className="mr-2" />, label: "Terms & Conditions", href: "#" },
      { icon: <FaChartLine className="mr-2" />, label: "Reporting", href: "#" },
      { icon: <FaFileAlt className="mr-2" />, label: "Documentation", href: "#" },
      { icon: <FaShieldAlt className="mr-2" />, label: "Support Policy", href: "#" },
      { icon: <FaLock className="mr-2" />, label: "Privacy", href: "#" }
    ]
  };

  return (
    <footer className={`py-4 sm:py-6 ${darkMode ? 'bg-[#05010d] text-gray-300' : 'bg-[#020617] text-gray-100'}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex flex-col items-start gap-3">
              <GenFitLogo size="large" />
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-[#22D3EE]/80 mt-2">
                  Your AI Fitness Partner
                </p>
                <p className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-300'}`}>
                  Precision coaching, posture tracking, and smart nutrition—powered by AI, designed for real humans.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-1">
              <h5 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h5>
              <ul className="space-y-3">
                {links.map((link, index) => {
                  // Hide install links if app is already installed
                  if (link.show === false) return null;
                  
                  return (
                    <li key={index}>
                      {link.isNavLink ? (
                        <NavLink 
                          to={link.href}
                          className={`flex items-center ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors cursor-pointer`}
                        >
                          {link.icon}
                          {link.label}
                        </NavLink>
                      ) : (
                        <a
                          href={link.href}
                          onClick={link.onClick || undefined}
                          className={`flex items-center ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors cursor-pointer`}
                        >
                          {link.icon}
                          {link.label}
                        </a>
                      )}
                    </li>

                  );
                })}
              </ul>
            </div>
          ))}

          {/* Social Links */}
          <div className="lg:col-span-1">
            <h5 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Follow Us
            </h5>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className={`p-2 rounded-full shadow-sm transition-colors ${darkMode ? 'bg-[#020617]/80 backdrop-blur-sm border border-[#1F2937] text-gray-300 hover:bg-[#1F2937] hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'}`}
                aria-label="Facebook"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="#"
                className={`p-2 rounded-full shadow-sm transition-colors ${darkMode ? 'bg-[#020617]/80 backdrop-blur-sm border border-[#1F2937] text-gray-300 hover:bg-[#1F2937] hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'}`}
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="#"
                className={`p-2 rounded-full shadow-sm transition-colors ${darkMode ? 'bg-[#020617]/80 backdrop-blur-sm border border-[#1F2937] text-gray-300 hover:bg-[#1F2937] hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'}`}
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
            </div>
            <div className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              <FaEnvelope className="mr-2" />
              <a href="mailto:genfitai@example.com" className="hover:underline">
                genfitai@example.com
              </a>
            </div>
          </div>
        </div>

        <div className={`border-t mt-6 pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className={`text-sm text-center sm:text-left ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              &copy; {new Date().getFullYear()} GenFit AI. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}>
                Privacy Policy
              </a>
              <a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}>
                Terms of Service
              </a>
              <a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}