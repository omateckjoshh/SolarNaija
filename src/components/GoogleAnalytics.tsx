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
        // Add noscript fallback image for browsers with JS disabled
        const noscriptImg = document.createElement('img');
        noscriptImg.setAttribute('height', '1');
        noscriptImg.setAttribute('width', '1');
        noscriptImg.setAttribute('style', 'display:none');
        noscriptImg.setAttribute('id', 'fb-pixel-noscript');
        noscriptImg.setAttribute('src', `https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`);
        document.head.appendChild(noscriptImg);
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
      const noscriptImg = document.getElementById('fb-pixel-noscript');
      if (noscriptImg && noscriptImg.parentNode) noscriptImg.parentNode.removeChild(noscriptImg);
    };
  }, []);

  return null;
};

export default GoogleAnalytics;