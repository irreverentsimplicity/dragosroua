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

  // Generate archive pages (year/month combinations)
  const archivePages = [];
  const dateGroups = new Map();
  
  posts.forEach(post => {
    const date = new Date(post.date);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const key = `${year}/${month}`;
    
    if (!dateGroups.has(key)) {
      dateGroups.set(key, []);
    }
    dateGroups.get(key).push(post);
  });
  
  // Create archive page entries
  dateGroups.forEach((monthPosts, dateKey) => {
    const [year, month] = dateKey.split('/');
    archivePages.push({
      url: `/${year}/${month}/`,
      priority: 0.4,
      lastmod: new Date(Math.max(...monthPosts.map(p => new Date(p.date)))).toISOString().split('T')[0],
      changefreq: 'yearly'
    });
  });

  // Generate blog pagination pages (assuming 20 posts per page)
  const postsPerPage = 20;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const blogPages = [];
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1) {
      // Main blog page (already included in static pages)
      continue;
    }
    blogPages.push({
      url: `/blog/${i}/`,
      priority: 0.5,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly'
    });
  }

  // Generate ALL category pages (not just strategic ones)
  const allCategoryPages = [];
  categories.forEach(category => {
    if (category.count > 0) {
      // Main category page
      allCategoryPages.push({
        url: `/category/${category.slug}/`,
        priority: strategicCategories[category.slug] || 0.4,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly'
      });
      
      // Category pagination pages
      const categoryPagesCount = Math.ceil(category.count / postsPerPage);
      for (let i = 2; i <= categoryPagesCount; i++) {
        allCategoryPages.push({
          url: `/category/${category.slug}/${i}/`,
          priority: 0.3,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'monthly'
        });
      }
    }
  });

  // Generate ALL tag pages (not just strategic ones)
  const allTagPages = [];
  tags.forEach(tag => {
    if (tag.count > 0) {
      // Main tag page
      allTagPages.push({
        url: `/tag/${tag.slug}/`,
        priority: strategicTags[tag.slug] || 0.3,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly'
      });
      
      // Tag pagination pages
      const tagPagesCount = Math.ceil(tag.count / postsPerPage);
      for (let i = 2; i <= tagPagesCount; i++) {
        allTagPages.push({
          url: `/tag/${tag.slug}/${i}/`,
          priority: 0.2,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'monthly'
        });
      }
    }
  });

  // Log sitemap composition for debugging
  console.log(`\n📋 Sitemap Generation Summary:`);
  console.log(`   📄 Posts: ${posts.length}`);
  console.log(`   📖 Pages: ${pages.length}`);
  console.log(`   📅 Archive pages: ${archivePages.length}`);
  console.log(`   📰 Blog pagination: ${blogPages.length}`);
  console.log(`   🏷️  Category pages: ${allCategoryPages.length}`);
  console.log(`   🔖 Tag pages: ${allTagPages.length}`);
  console.log(`   🏠 Static pages: 8`); // homepage, blog, categories, ultrabalaton, daughter, privacy, terms
  
  const totalUrls = posts.length + pages.length + archivePages.length + blogPages.length + allCategoryPages.length + allTagPages.length + 8;
  console.log(`   ✨ Total URLs: ${totalUrls}\n`);

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
  ${[...archivePages, ...blogPages, ...allCategoryPages, ...allTagPages].map(page => `
  <url>
    <loc>https://dragosroua.com${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
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