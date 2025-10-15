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