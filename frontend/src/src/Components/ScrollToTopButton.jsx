import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top cleanly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      <style>{`
        .scroll-to-top-button {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #22D3EE);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 14px rgba(34, 211, 238, 0.4);
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .scroll-to-top-button.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .scroll-to-top-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
        }
        
        .scroll-to-top-button:active {
          transform: translateY(0px);
        }
      `}</style>
      <button
        type="button"
        className={`scroll-to-top-button ${isVisible ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Scroll to Top"
        style={{
          // Only show on non-admin routes if desired, but request says "every page"
        }}
      >
        <FiArrowUp />
      </button>
    </>
  );
};

export default ScrollToTopButton;
