import { useEffect } from 'react';
import { initFacebookPixel } from '../utils/analytics';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const GoogleAnalytics: React.FC = () => {
  useEffect(() => {
    const GA_ID = import.meta.env.VITE_GA_ID;
    const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;
    
    if (FB_PIXEL_ID) {
      try {
        initFacebookPixel(FB_PIXEL_ID);
      } catch (err) {
        console.debug('initFacebookPixel failed', err);
      }
    }

    if (!GA_ID) return;

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script1);

    // Initialize Google Analytics
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return null;
};

export default GoogleAnalytics;