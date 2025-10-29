import { getAllPosts, getAllPages, getAllCategories, getAllTags } from '../lib/wordpress';

// Strategic taxonomy slugs and their SEO priorities
const strategicCategories = {
  'personal-development': 0.8,
  'running': 0.7,
  'business': 0.7,
  'financial-resilience': 0.7,
  'productivity-effectiveness': 0.7,
  'meaningful-relationships': 0.6,
  'blogging': 0.6,
  'digital-tools': 0.6
};

const strategicTags = {
  'financial-freedom': 0.6,
  'personal-development': 0.6,
  'money-tips': 0.6,
  'habits': 0.5,
  'life': 0.5,
  'motivation': 0.5,
  'goals': 0.5,
  'productivity': 0.5
};

export async function GET() {
  const [posts, pages, categories, tags] = await Promise.all([
    getAllPosts(),
    getAllPages(),
    getAllCategories(),
    getAllTags()
  ]);

  // Filter and prioritize taxonomy pages
  const strategicCategoryPages = categories
    .filter(cat => strategicCategories[cat.slug] && cat.count >= 3) // Only include categories with 3+ posts
    .map(cat => ({
      url: `/category/${cat.slug}/`,
      priority: strategicCategories[cat.slug],
      lastmod: new Date().toISOString().split('T')[0]
    }));

  const strategicTagPages = tags
    .filter(tag => strategicTags[tag.slug] && tag.count >= 5) // Only include tags with 5+ posts
    .map(tag => ({
      url: `/tag/${tag.slug}/`,
      priority: strategicTags[tag.slug],
      lastmod: new Date().toISOString().split('T')[0]
    }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dragosroua.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://dragosroua.com/blog/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://dragosroua.com/categories/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://dragosroua.com/ultrabalaton-220km-ultra-marathon-series/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://dragosroua.com/7-things-i-learned-from-my-daughter-series/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://dragosroua.com/privacy-policy/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://dragosroua.com/terms-of-service/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  ${[...strategicCategoryPages, ...strategicTagPages].map(page => `
  <url>
    <loc>https://dragosroua.com${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${posts.map(post => `
  <url>
    <loc>https://dragosroua.com${post.uri}</loc>
    <lastmod>${new Date(post.modified || post.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${pages.map(page => `
  <url>
    <loc>https://dragosroua.com${page.uri}</loc>
    <lastmod>${new Date(page.modified || page.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400' // Cache 24 hours
    }
  });
}