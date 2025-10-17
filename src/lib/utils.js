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
function generateImageAltText(node, postTitle) {
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

// Get optimized image size from WordPress media
export function getOptimizedImage(featuredImage, targetWidth = 300, postTitle = '') {
  if (!featuredImage?.node) return null;
  
  const node = featuredImage.node;
  const fullUrl = node.sourceUrl;
  const sizes = node.mediaDetails?.sizes || [];
  const altText = generateImageAltText(node, postTitle);
  
  // First try: Use GraphQL sizes if available
  const suitableSize = sizes.find(size => 
    size.width >= targetWidth && size.width <= targetWidth * 1.5
  );
  
  if (suitableSize) {
    return {
      url: suitableSize.sourceUrl,
      alt: altText,
      width: suitableSize.width,
      height: suitableSize.height
    };
  }
  
  // Second try: Construct WordPress sized URL
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
  
  // Fallback: use original
  return {
    url: fullUrl,
    alt: altText,
    width: node.mediaDetails?.width || 300,
    height: node.mediaDetails?.height || 200
  };
}