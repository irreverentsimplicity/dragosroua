// Global optimization statistics tracking
let optimizationStats = {
  linksOptimized: 0,
  imagesOptimized: 0,
  postsProcessed: 0,
  reset() {
    this.linksOptimized = 0;
    this.imagesOptimized = 0;
    this.postsProcessed = 0;
  },
  log() {
    console.log(`\n📊 Link & Image Optimization Results:`);
    console.log(`   📝 Posts processed: ${this.postsProcessed}`);
    console.log(`   🔗 Links optimized: ${this.linksOptimized}`);
    console.log(`   🖼️  Images optimized: ${this.imagesOptimized}`);
    console.log(`   ✅ Total optimizations: ${this.linksOptimized + this.imagesOptimized}\n`);
  }
};

// Export stats for access from build process
export function getOptimizationStats() {
  return optimizationStats;
}

// Reset stats at start of build
export function resetOptimizationStats() {
  optimizationStats.reset();
}

// Comprehensive content optimization with detailed logging
export function optimizeContentLinksAndImages(content, postTitle = '') {
  if (!content) return content;
  
  let optimizedContent = content;
  let localLinksOptimized = 0;
  let localImagesOptimized = 0;
  
  // 1. LINK OPTIMIZATION: Remove www from internal dragosroua.com links
  optimizedContent = optimizedContent.replace(
    /href=["']https?:\/\/www\.dragosroua\.com\/?([^"']*)/g, 
    (match, path) => {
      localLinksOptimized++;
      return `href="https://dragosroua.com/${path}`;
    }
  );
  
  // 2. IMAGE OPTIMIZATION: Ensure all dragosroua.com images use wp subdomain
  // Special case: Replace blog-box-promo.png with local WebP version
  optimizedContent = optimizedContent.replace(
    /src=["']https?:\/\/wp\.dragosroua\.com\/wp-content\/uploads\/[^"']*blog-box-promo\.png["']/g,
    (match) => {
      localImagesOptimized++;
      return `src="/images/blog-box-promo.webp"`;
    }
  );
  
  // Match image sources that point to main domain
  optimizedContent = optimizedContent.replace(
    /src=["']https?:\/\/(?:www\.)?dragosroua\.com\/(wp-content\/[^"']*)/g,
    (match, wpPath) => {
      localImagesOptimized++;
      return `src="https://wp.dragosroua.com/${wpPath}`;
    }
  );
  
  // Also handle srcset attributes for responsive images
  optimizedContent = optimizedContent.replace(
    /srcset=["']([^"']*)/g,
    (match, srcsetValue) => {
      let originalSrcset = srcsetValue;
      let modifiedSrcset = srcsetValue.replace(
        /https?:\/\/(?:www\.)?dragosroua\.com\/(wp-content\/[^,\s]*)/g,
        (imgMatch, wpPath) => {
          localImagesOptimized++;
          return `https://wp.dragosroua.com/${wpPath}`;
        }
      );
      
      if (originalSrcset !== modifiedSrcset) {
        return `srcset="${modifiedSrcset}`;
      }
      return match;
    }
  );
  
  // Fix wp-content href links (click-to-enlarge functionality)
  optimizedContent = optimizedContent.replace(
    /href=["']\/wp-content\/uploads\/([^"']*)/g,
    (match, wpPath) => {
      localLinksOptimized++;
      console.log(`🔗 Fixing wp-content href link: ${match} → href="https://wp.dragosroua.com/wp-content/uploads/${wpPath}"`);
      return `href="https://wp.dragosroua.com/wp-content/uploads/${wpPath}`;
    }
  );
  
  // 3. LINK REDIRECTS: Redirect about and contact pages to about-me
  // Handle relative about links
  optimizedContent = optimizedContent.replace(
    /href=["']\/about\/?["']/g,
    (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting relative about link: ${match} → href="/about-me/"`);
      return 'href="/about-me/"';
    }
  );
  
  // Handle absolute about links with domain
  optimizedContent = optimizedContent.replace(
    /href=["']https?:\/\/(?:www\.)?dragosroua\.com\/about\/?["']/g,
    (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting absolute about link: ${match} → href="/about-me/"`);
      return 'href="/about-me/"';
    }
  );
  
  // Handle relative contact links
  optimizedContent = optimizedContent.replace(
    /href=["']\/contact\/?["']/g,
    (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting relative contact link: ${match} → href="/about-me/"`);
      return 'href="/about-me/"';
    }
  );
  
  // Handle absolute contact links with domain
  optimizedContent = optimizedContent.replace(
    /href=["']https?:\/\/(?:www\.)?dragosroua\.com\/contact\/?["']/g,
    (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting absolute contact link: ${match} → href="/about-me/"`);
      return 'href="/about-me/"';
    }
  );
  
  // Handle contact-2 links (redirect to about-me)
  optimizedContent = optimizedContent.replace(
    /href=["']\/contact-2\/?["']/g,
    (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting relative contact-2 link: ${match} → href="/about-me/"`);
      return 'href="/about-me/"';
    }
  );
  
  optimizedContent = optimizedContent.replace(
    /href=["']https?:\/\/(?:www\.)?dragosroua\.com\/contact-2\/?["']/g,
    (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting absolute contact-2 link: ${match} → href="/about-me/"`);
      return 'href="/about-me/"';
    }
  );
  
  // 4. BOOK PAGE REDIRECTS: Redirect book pages to /books/
  const bookPages = [
    '100-ways-to-screw-up-your-life-the-book',
    '100-ways-to-improve-your-life-the-book',
    'the-7-ages-of-an-online-business-the-book',
    'brilliantly-better-the-ebook-the-soft-launch',
    'free-books-pay-like'
  ];
  
  bookPages.forEach(page => {
    // Relative links
    const relativePattern = new RegExp(`href=["']\/${page}\/?["']`, 'g');
    optimizedContent = optimizedContent.replace(relativePattern, (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting book page: ${match} → href="/books/"`);
      return 'href="/books/"';
    });
    
    // Absolute links with domain
    const absolutePattern = new RegExp(`href=["']https?:\\/\\/(?:www\\.)?dragosroua\\.com\\/${page}\\/?["']`, 'g');
    optimizedContent = optimizedContent.replace(absolutePattern, (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting book page: ${match} → href="/books/"`);
      return 'href="/books/"';
    });
  });
  
  // 5. REDIRECT TO CATEGORIES: Redirect top-posts to categories
  const topPostsPattern = [
    'top-posts-total'
  ];
  
  topPostsPattern.forEach(page => {
    // Relative links
    const relativePattern = new RegExp(`href=["']\/${page}\/?["']`, 'g');
    optimizedContent = optimizedContent.replace(relativePattern, (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting top posts page: ${match} → href="/categories/"`);
      return 'href="/categories/"';
    });
    
    // Absolute links with domain
    const absolutePattern = new RegExp(`href=["']https?:\\/\\/(?:www\\.)?dragosroua\\.com\\/${page}\\/?["']`, 'g');
    optimizedContent = optimizedContent.replace(absolutePattern, (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting top posts page: ${match} → href="/categories/"`);
      return 'href="/categories/"';
    });
  });
  
  // 6. HUB PAGE REDIRECTS: Redirect hub pages to categories
  const hubPages = [
    { page: 'financial-resilience', target: '/category/financial-resilience/' },
    { page: 'location-independence', target: '/category/location-independence/' },
    { page: 'meaningful-relationships', target: '/category/meaningful-relationships/' }
  ];
  
  hubPages.forEach(({ page, target }) => {
    // Relative links
    const relativePattern = new RegExp(`href=["']\/${page}\/?["']`, 'g');
    optimizedContent = optimizedContent.replace(relativePattern, (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting hub page: ${match} → href="${target}"`);
      return `href="${target}"`;
    });
    
    // Absolute links with domain
    const absolutePattern = new RegExp(`href=["']https?:\\/\\/(?:www\\.)?dragosroua\\.com\\/${page}\\/?["']`, 'g');
    optimizedContent = optimizedContent.replace(absolutePattern, (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting hub page: ${match} → href="${target}"`);
      return `href="${target}"`;
    });
  });
  
  // 7. ORPHANED PAGE REDIRECTS: Redirect orphaned pages to work-with-me
  const orphanedPages = [
    '1250-ideas-for-your-bucket-list',
    '100-days-challenge',
    '100-days-challenge-thanks',
    'cart',
    'checkout', 
    'pricing',
    'black-friday-2013',
    'december-2012-bundle',
    'build-reputation-download',
    'build-reputation-landing',
    'thanks',
    'thank-help',
    'thank-you-for-subscribing',
    'test',
    'uncopyright',
    'donate',
    'on-living-a-better-life-screwing-up-and-everything-in-between',
    'running-for-my-life',
    'downloads',
    'wordpress-plugin-blog-audit',
    'the-first-6-months-of-blogging-writing',
    'being-a-digital-nomad-the-workshop',
    'lets-do-this'
  ];
  
  orphanedPages.forEach(page => {
    // Relative links
    const relativePattern = new RegExp(`href=["']\/${page}\/?["']`, 'g');
    optimizedContent = optimizedContent.replace(relativePattern, (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting orphaned page: ${match} → href="/work-with-me/"`);
      return 'href="/work-with-me/"';
    });
    
    // Absolute links with domain
    const absolutePattern = new RegExp(`href=["']https?:\\/\\/(?:www\\.)?dragosroua\\.com\\/${page}\\/?["']`, 'g');
    optimizedContent = optimizedContent.replace(absolutePattern, (match) => {
      localLinksOptimized++;
      console.log(`🔀 Redirecting orphaned page: ${match} → href="/work-with-me/"`);
      return 'href="/work-with-me/"';
    });
  });
  
  // 8. WORDPRESS ARCHIVE LINKS: Convert WordPress archive links to static site
  // Fix WordPress category archive links to static category pages
  optimizedContent = optimizedContent.replace(
    /href=["']https?:\/\/wp\.dragosroua\.com\/category\/([^\/]+)\/?["']/g,
    (match, categorySlug) => {
      localLinksOptimized++;
      console.log(`🗂️  Fixing WordPress category link: ${match} → href="/category/${categorySlug}/"`);
      return `href="/category/${categorySlug}/"`;
    }
  );
  
  // Fix WordPress date archive links to static date archive pages
  optimizedContent = optimizedContent.replace(
    /href=["']https?:\/\/wp\.dragosroua\.com\/(20[0-9][0-9])\/([0-1][0-9])\/?["']/g,
    (match, year, month) => {
      localLinksOptimized++;
      console.log(`📅 Fixing WordPress date archive link: ${match} → href="/${year}/${month}/"`);
      return `href="/${year}/${month}/"`;
    }
  );
  
  // 9. WORDPRESS POST/PAGE LINKS: Convert WordPress post/page links to static site
  // This catches any remaining WordPress content links (posts, pages, etc.)
  optimizedContent = optimizedContent.replace(
    /href=["']https?:\/\/wp\.dragosroua\.com\/([^"']*?)["']/g,
    (match, path) => {
      // Skip if it's already a wp-content/uploads link (images)
      if (path.includes('wp-content/uploads')) {
        return match;
      }
      localLinksOptimized++;
      console.log(`📝 Fixing WordPress content link: ${match} → href="/${path}"`);
      return `href="/${path}"`;
    }
  );

  // 10. LEGACY OPTIMIZATION: Convert any remaining absolute internal links to relative
  optimizedContent = optimizedContent.replace(
    /href=["']https?:\/\/dragosroua\.com\//g, 
    'href="/'
  );
  
  // Update global stats
  optimizationStats.linksOptimized += localLinksOptimized;
  optimizationStats.imagesOptimized += localImagesOptimized;
  optimizationStats.postsProcessed++;
  
  // Log if optimizations were made for this post
  if (localLinksOptimized > 0 || localImagesOptimized > 0) {
    console.log(`🔧 Optimized "${postTitle || 'content'}": ${localLinksOptimized} links, ${localImagesOptimized} images`);
  }
  
  return optimizedContent;
}

// Legacy function for backward compatibility - now uses new optimization
export function makeLinksRelative(content) {
  return optimizeContentLinksAndImages(content);
}

// Convert WordPress image URLs to new subdomain
export function updateWordPressImageUrls(url) {
  if (!url) return url;
  
  // Convert old WordPress domain to new subdomain for images
  return url
    .replace(/https?:\/\/dragosroua\.com\/wp-content\//g, 'https://wp.dragosroua.com/wp-content/')
    .replace(/https?:\/\/www\.dragosroua\.com\/wp-content\//g, 'https://wp.dragosroua.com/wp-content/');
}

// Clean canonical URLs to use correct domain
export function cleanCanonicalUrl(url) {
  if (!url) return url;
  
  // Convert wp.dragosroua.com and www.dragosroua.com to dragosroua.com
  return url
    .replace(/https?:\/\/wp\.dragosroua\.com\//g, 'https://dragosroua.com/')
    .replace(/https?:\/\/www\.dragosroua\.com\//g, 'https://dragosroua.com/');
}

// Decode HTML entities
function decodeHTMLEntities(text) {
  const entities = {
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '–',
    '&#8212;': '—',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&nbsp;': ' '
  };
  
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  // Handle numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => 
    String.fromCharCode(dec)
  );
  
  return decoded;
}

// Generate excerpt from content
export function generateExcerpt(content, maxWords = 20) {
  if (!content) return '';
  
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  const decodedText = decodeHTMLEntities(text);
  
  // Clean whitespace
  const cleaned = decodedText.replace(/\s+/g, ' ').trim();
  
  // Split into words
  const words = cleaned.split(' ');
  
  // Take first N words
  const excerpt = words.slice(0, maxWords).join(' ');
  
  // Add ellipsis if truncated
  return words.length > maxWords ? excerpt + ' [...]' : excerpt;
}

// Generate descriptive alt text for featured images
export function generateImageAltText(node, postTitle) {
  // If WordPress has alt text, use it
  if (node.altText && node.altText.trim()) {
    return node.altText.trim();
  }
  
  // Extract filename without extension for descriptive fallback
  const filename = node.sourceUrl?.split('/').pop()?.split('.')[0] || '';
  
  // Create descriptive alt text based on post title
  if (postTitle) {
    const cleanTitle = postTitle.replace(/<[^>]*>/g, '').trim();
    return `Featured image for: ${cleanTitle}`;
  }
  
  // Fallback to filename if available
  if (filename) {
    return `Featured image: ${filename.replace(/[-_]/g, ' ')}`;
  }
  
  // Last resort
  return 'Featured image for blog post';
}

// Get featured image data for local optimization
export function getFeaturedImageData(featuredImage, postTitle = '') {
  // Return default post image if no featured image
  if (!featuredImage?.node) {
    return {
      src: '/images/default-featured-1200-630.png',
      alt: 'Dragos Roua - Default featured image',
      width: 1200,
      height: 630
    };
  }
  
  const node = featuredImage.node;
  const altText = generateImageAltText(node, postTitle);
  
  return {
    src: updateWordPressImageUrls(node.sourceUrl),
    alt: altText,
    width: node.mediaDetails?.width || 1200,
    height: node.mediaDetails?.height || 675
  };
}

// Get responsive image data for WordPress images
export function getResponsiveImage(featuredImage, postTitle = '') {
  // Return default responsive images if no featured image
  if (!featuredImage?.node) {
    return {
      src: '/images/default-featured-1200-630.png',
      alt: 'Dragos Roua - Default featured image',
      srcset: '/images/default-featured-300-250.png 300w, /images/default-featured-1200-630.png 1200w',
      sizes: '(max-width: 768px) 100vw, 800px',
      width: 800,
      height: 533
    };
  }
  
  const node = featuredImage.node;
  const sizes = node.mediaDetails?.sizes || [];
  const altText = generateImageAltText(node, postTitle);
  const fullUrl = updateWordPressImageUrls(node.sourceUrl);
  
  // Build srcset from available WordPress sizes
  const srcsetEntries = [];
  const targetWidths = [380, 600, 800, 1200]; // Mobile-first responsive breakpoints
  
  // Find best matching WordPress thumbnail for each target width
  targetWidths.forEach(targetWidth => {
    let bestSize = null;
    let bestScore = Infinity;
    
    for (const size of sizes) {
      const widthDiff = Math.abs(size.width - targetWidth);
      const ratio = size.width / targetWidth;
      
      // Prefer sizes that are close to target, not too small or too large
      let score = widthDiff;
      if (ratio < 0.7) score += 1000; // Too small penalty
      if (ratio > 2.0) score += 500;  // Too large penalty
      
      if (score < bestScore && size.width >= targetWidth * 0.7) {
        bestScore = score;
        bestSize = size;
      }
    }
    
    if (bestSize) {
      srcsetEntries.push(`${updateWordPressImageUrls(bestSize.sourceUrl)} ${bestSize.width}w`);
    }
  });
  
  // Always include original as fallback
  const originalWidth = node.mediaDetails?.width || 800;
  if (originalWidth >= 800 && !srcsetEntries.some(entry => entry.includes(`${originalWidth}w`))) {
    srcsetEntries.push(`${fullUrl} ${originalWidth}w`);
  }
  
  // Find best default src (prefer ~800px)
  const defaultSrc = sizes.find(s => s.width >= 600 && s.width <= 900)?.sourceUrl || 
                     sizes.find(s => s.width >= 400)?.sourceUrl || 
                     node.sourceUrl;
  
  return {
    src: updateWordPressImageUrls(defaultSrc),
    alt: altText,
    srcset: srcsetEntries.length > 1 ? srcsetEntries.join(', ') : '',
    sizes: '(max-width: 768px) 100vw, 800px',
    width: 800,
    height: 533
  };
}

// Get optimized image size from WordPress media
export function getOptimizedImage(featuredImage, targetWidth = 300, postTitle = '') {
  // Return default card image if no featured image
  if (!featuredImage?.node) {
    return {
      url: '/images/default-featured-300-250.png',
      alt: 'Dragos Roua - Default featured image',
      width: 300,
      height: 250
    };
  }
  
  const node = featuredImage.node;
  const fullUrl = updateWordPressImageUrls(node.sourceUrl);
  const sizes = node.mediaDetails?.sizes || [];
  const altText = generateImageAltText(node, postTitle);
  
  // Smart size selection - find the best available thumbnail
  let bestSize = null;
  let bestScore = Infinity;
  
  for (const size of sizes) {
    // Calculate score based on:
    // 1. How close to target width
    // 2. Efficiency penalty for oversized images
    // 3. Quality penalty for undersized images
    // 4. Bonus for common WordPress sizes
    
    const widthDiff = Math.abs(size.width - targetWidth);
    const ratio = size.width / targetWidth;

    
    // Penalize images that are too large (bandwidth waste)
    let efficiencyPenalty = 0;
    if (ratio > 2.5) efficiencyPenalty = 2000; // Very oversized
    else if (ratio > 2) efficiencyPenalty = 1000; // Moderately oversized
    else if (ratio > 1.5) efficiencyPenalty = 200; // Slightly oversized
    
    // Penalize images that are too small (quality loss)
    let qualityPenalty = 0;
    if (ratio < 0.6) qualityPenalty = 500; // Too small
    else if (ratio < 0.8) qualityPenalty = 100; // Somewhat small
    
    // Bonus for common WordPress sizes (more likely to be optimized)
    let sizeBonus = 0;
    if ([150, 300, 600, 768, 1024].includes(size.width)) sizeBonus = -50;
    
    const score = widthDiff + efficiencyPenalty + qualityPenalty + sizeBonus;
    
    // Only consider sizes that are at least 60% of target (avoid too small images)
    if (score < bestScore && size.width >= targetWidth * 0.6) {
      bestScore = score;
      bestSize = size;
    }
  }
  
  if (bestSize) {
    // Optional: Log the selection for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Image optimization for "${postTitle}": Using ${bestSize.width}x${bestSize.height} (target: ${targetWidth}px)`);
    }
    
    return {
      url: updateWordPressImageUrls(bestSize.sourceUrl),
      alt: altText,
      width: bestSize.width,
      height: bestSize.height
    };
  }
  
  // Fallback: Construct WordPress sized URL (for images without generated thumbnails)
  if (node.mediaDetails?.width && node.mediaDetails?.height) {
    const originalWidth = node.mediaDetails.width;
    const originalHeight = node.mediaDetails.height;
    
    // Skip if image is already smaller than target
    if (originalWidth <= targetWidth) {
      return {
        url: fullUrl,
        alt: altText,
        width: originalWidth,
        height: originalHeight
      };
    }
    
    // Calculate proportional height
    const targetHeight = Math.round((originalHeight / originalWidth) * targetWidth);
    
    // Parse URL and handle WordPress patterns
    // Example: image-scaled.jpg or image.jpg
    const urlMatch = fullUrl.match(/^(.+\/)([^\/]+?)(-scaled)?(\.[^.]+)$/);
    
    if (urlMatch) {
      const [, basePath, filename, , extension] = urlMatch;
      // Construct: basePath + filename + -300x200 + extension
      const optimizedUrl = `${basePath}${filename}-${targetWidth}x${targetHeight}${extension}`;
      
      return {
        url: optimizedUrl,
        alt: altText,
        width: targetWidth,
        height: targetHeight
      };
    }
  }
  
  // Last resort: use original image
  return {
    url: fullUrl,
    alt: altText,
    width: node.mediaDetails?.width || 300,
    height: node.mediaDetails?.height || 200
  };
}