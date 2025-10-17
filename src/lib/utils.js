// Convert absolute WordPress URLs to relative paths
export function makeLinksRelative(content) {
  if (!content) return '';
  
  return content
    // Fix internal links (not images)
    .replace(/href=["']https?:\/\/dragosroua\.com\//g, 'href="/')
    .replace(/href=["']https?:\/\/www\.dragosroua\.com\//g, 'href="/');
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
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => 
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
  if (!featuredImage?.node) return null;
  
  const node = featuredImage.node;
  const altText = generateImageAltText(node, postTitle);
  
  return {
    src: node.sourceUrl,
    alt: altText,
    width: node.mediaDetails?.width || 1200,
    height: node.mediaDetails?.height || 675
  };
}

// Get optimized image size from WordPress media
export function getOptimizedImage(featuredImage, targetWidth = 300, postTitle = '') {
  if (!featuredImage?.node) return null;
  
  const node = featuredImage.node;
  const fullUrl = node.sourceUrl;
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
      url: bestSize.sourceUrl,
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