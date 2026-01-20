'use client';

import { useEffect, useState } from 'react';
import './Loader.css';

export default function Loader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      // Wait at least 2 seconds before hiding loader
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Fallback: hide loader after 3 seconds maximum
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="clock-loader">
          <div className="clock-face">
            <div className="clock-hand"></div>
          </div>
        </div>
        <div className="loader-text">შეუკვეთეთ ნივთები ჩვენთან ერთად</div>
      </div>
    </div>
  );
}
