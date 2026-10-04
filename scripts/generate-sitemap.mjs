import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from 'vite';

const siteUrl = 'https://upharthegiftshop.netlify.app';
const staticPaths = [
  '/',
  '/shop',
  '/categories',
  '/occasions',
  '/new-arrivals',
  '/pre-orders',
  '/deals',
  '/contact',
];
const pageSize = 1000;
const env = loadEnv('production', process.cwd(), '');
const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl && !supabaseAnonKey) {
  console.warn(
    'Skipping dynamic sitemap URLs: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured. Keeping the checked-in public landing-page sitemap.'
  );
  process.exit(0);
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Dynamic sitemap generation requires both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const fetchActiveValues = async (table, column) => {
  const values = [];

  for (let offset = 0; ; offset += pageSize) {
    const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
    endpoint.searchParams.set('select', column);
    endpoint.searchParams.set('is_active', 'eq.true');
    endpoint.searchParams.set('order', `${column}.asc`);

    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Range-Unit': 'items',
        Range: `${offset}-${offset + pageSize - 1}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Unable to fetch active ${table} for sitemap generation (HTTP ${response.status}). Check Supabase URL, anon-key access, and public-read policies.`
      );
    }

    const rows = await response.json();
    if (!Array.isArray(rows)) {
      throw new Error(`Supabase returned an invalid ${table} response for sitemap generation.`);
    }

    for (const row of rows) {
      const value = row?.[column];
      if (typeof value === 'string' && value.trim()) values.push(value.trim());
    }

    if (rows.length < pageSize) break;
  }

  return values;
};

const productIds = await fetchActiveValues('products', 'id');
const categorySlugs = await fetchActiveValues('categories', 'slug');
const occasionSlugs = await fetchActiveValues('occasions', 'slug');
const urls = new Set(staticPaths.map((pathname) => `${siteUrl}${pathname}`));

for (const id of productIds) {
  urls.add(`${siteUrl}/product/${encodeURIComponent(id)}`);
}

for (const slug of categorySlugs) {
  urls.add(`${siteUrl}/category/${encodeURIComponent(slug)}`);
}

for (const slug of occasionSlugs) {
  urls.add(`${siteUrl}/occasions/${encodeURIComponent(slug)}`);
}

const entries = [...urls]
  .sort()
  .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

await writeFile(sitemapPath, sitemap, 'utf8');
console.info(
  `Generated sitemap with ${urls.size} URLs (${productIds.length} active products, ${categorySlugs.length} active categories, ${occasionSlugs.length} active occasions).`
);
