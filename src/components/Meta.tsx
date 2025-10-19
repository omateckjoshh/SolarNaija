import React from 'react';

interface MetaProps {
  title: string;
  description: string;
  keywords?: string;
}

const upsertMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const Meta: React.FC<MetaProps> = ({ title, description, keywords }) => {
  React.useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    upsertMeta('description', description);
    if (keywords) upsertMeta('keywords', keywords);

    // Open Graph tags (basic)
    upsertMeta('og:title', title);
    upsertMeta('og:description', description);

    return () => {
      document.title = prevTitle;
      // Note: we intentionally do not remove meta tags on unmount to avoid flicker
    };
  }, [title, description, keywords]);

  return null;
};

export default Meta;
