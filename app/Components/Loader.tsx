'use client';

import { useEffect, useState } from 'react';
import './Loader.css';

const loaderTexts = [
  'შეუკვეთეთ ნივთები ჩვენთან ერთად',
  'სწრაფი და უსაფრთხო მიწოდება',
  'საიმედო ლოგისტიკური მომსახურება',
  'თქვენი ნივთები უსაფრთხო ხელებშია',
  'პროფესიონალური მომსახურება',
];

export default function Loader() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const handleLoad = () => {
      // Wait at least 2 seconds before hiding loader
      setTimeout(() => {
        setIsLoading(false);
      }, 4000);
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
    }, 5000);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    // Change text every 1.5 seconds
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => 
        (prevIndex + 1) % loaderTexts.length
      );
    }, 1500);

    return () => {
      clearInterval(textInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-content">
      <div className="center">
  <div className="ring">

  </div>
  <span>{loaderTexts[currentTextIndex]}</span>
</div>
       
      </div>
    </div>
  );
}
