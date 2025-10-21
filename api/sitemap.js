const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.solarnaija.store';

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = async (req, res) => {
  try {
    if (!supabase) return res.status(500).send('Supabase not configured on server');

    // Fetch published products (assumes a published flag or simply all products)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10000);

    if (error) {
      console.error('sitemap supabase error', error);
      return res.status(500).send('Failed to fetch products');
    }

    const urls = [];
    // Add static pages
    urls.push({ loc: `${SITE_URL}/`, lastmod: new Date().toISOString() });
    urls.push({ loc: `${SITE_URL}/products`, lastmod: new Date().toISOString() });
    urls.push({ loc: `${SITE_URL}/contact`, lastmod: new Date().toISOString() });
    urls.push({ loc: `${SITE_URL}/about`, lastmod: new Date().toISOString() });

    // Category pages
    const categories = ['inverters','batteries','panels','kits','combos','controllers','street-lights','cctv','gadgets'];
    categories.forEach(cat => urls.push({ loc: `${SITE_URL}/products/${cat}`, lastmod: new Date().toISOString() }));

    // Product pages
    (products || []).forEach(p => {
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString();
      urls.push({ loc: `${SITE_URL}/product/${p.id}`, lastmod });
    });

    const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
    urls.forEach(u => {
      xml.push('  <url>');
      xml.push(`    <loc>${esc(u.loc)}</loc>`);
      if (u.lastmod) xml.push(`    <lastmod>${esc(u.lastmod)}</lastmod>`);
      xml.push('  </url>');
    });
    xml.push('</urlset>');

    const body = xml.join('\n');
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=59');
    return res.status(200).send(body);
  } catch (err) {
    console.error('sitemap generator error', err);
    return res.status(500).send('Server error');
  }
};
