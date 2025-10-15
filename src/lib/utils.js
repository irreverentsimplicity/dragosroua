// Convert absolute WordPress URLs to relative paths
export function makeLinksRelative(content) {
  if (!content) return '';
  
  return content
    // Fix internal links (not images - they stay on WP server)
    .replace(/href=["']https?:\/\/dragosroua\.com\//g, 'href="/')
    .replace(/href=["']https?:\/\/www\.dragosroua\.com\//g, 'href="/');
}