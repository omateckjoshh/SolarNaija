const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

const esc = (s = '') => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

module.exports = async (req, res) => {
  try {
    const { id } = req.query || {};
    const pid = Number(id);
    if (!pid) return res.status(400).send('Invalid product id');

    if (!supabase) return res.status(500).send('Supabase not configured on server');

    const { data: product, error } = await supabase.from('products').select('*').eq('id', pid).maybeSingle();
    if (error) {
      console.error('Supabase product fetch error', error);
      return res.status(500).send('Product fetch failed');
    }
    if (!product) return res.status(404).send('Product not found');

    let imageUrl = product.image || '';
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      if (SITE_URL) imageUrl = SITE_URL.replace(/\/$/, '') + '/' + imageUrl.replace(/^\//, '');
      else if (SUPABASE_URL) imageUrl = SUPABASE_URL.replace(/\/$/, '') + '/' + imageUrl.replace(/^\//, '');
    }

    const title = String(product.name || 'SolarNaija Product');
    const description = String((product.description || '').replace(/\n/g, ' ')).slice(0, 300);
    const url = (SITE_URL || '') + `/product/${pid}`;

    const html = `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${esc(title)}</title>
        <meta name="description" content="${esc(description)}" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content="${esc(title)}" />
        <meta property="og:description" content="${esc(description)}" />
        <meta property="og:url" content="${esc(url)}" />
        <meta property="og:image" content="${esc(imageUrl)}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${esc(title)}" />
        <meta name="twitter:description" content="${esc(description)}" />
        <meta name="twitter:image" content="${esc(imageUrl)}" />
        <link rel="canonical" href="${esc(url)}" />
        <script>
          try{ if (!/facebookexternalhit|Twitterbot|Slackbot|Discordbot|WhatsApp|Facebot|LinkedInBot|Pinterest/i.test(navigator.userAgent)) { window.location.replace('${esc(url)}'); } } catch(e){}
        </script>
      </head>
      <body>
        <p>Redirecting to product page…</p>
        <script>setTimeout(function(){ window.location.href='${esc(url)}'; },700);</script>
      </body>
    </html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    console.error('vercel product prerender error', err);
    res.status(500).send('Server error');
  }
};
