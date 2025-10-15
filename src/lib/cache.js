const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in dev mode

export async function getCached(key, fetcher) {
  const now = Date.now();
  
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    
    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION) {
      console.log(`⚡ Using cached data for: ${key} (saved ${Math.round((now - timestamp) / 1000)}s ago)\n`);
      return data;
    } else {
      console.log(`⏰ Cache expired for: ${key} (${Math.round((now - timestamp) / 1000)}s old)\n`);
    }
  }
  
  // Cache miss or expired - fetch fresh data
  console.log(`🔄 Fetching fresh data for: ${key}\n`);
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  
  return data;
}

// Clear cache manually if needed
export function clearCache() {
  cache.clear();
  console.log('🗑️  Cache cleared\n');
}