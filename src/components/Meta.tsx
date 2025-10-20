import React from 'react';

interface MetaProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

const upsertMeta = (attrName: string, attrValue: string, isProperty = false) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    const key = isProperty ? 'property' : 'name';
    el.setAttribute(key, attrName);
    document.head.appendChild(el);
  }
  el.setAttribute('content', attrValue);
};

const Meta: React.FC<MetaProps> = ({ title, description, keywords, image }) => {
  React.useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    upsertMeta('description', description);
    if (keywords) upsertMeta('keywords', keywords);

    // Open Graph tags (use property attribute)
    upsertMeta('og:title', title, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:type', 'website', true);

    const siteImage = image || (import.meta.env.VITE_SOCIAL_IMAGE as string) || '/logo.png';
    upsertMeta('og:image', siteImage, true);

    // Twitter card
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertMeta('twitter:image', siteImage);

    return () => {
      document.title = prevTitle;
      // we intentionally leave meta tags in place to avoid flicker
    };
  }, [title, description, keywords, image]);

  return null;
};

export default Meta;
