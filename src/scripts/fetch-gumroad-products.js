import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

// Product IDs from your current embeds
const PRODUCT_IDS = [
  'motivation33',
  'mornings33', 
  'freshstart50'
];

/**
 * Fetches product data from Gumroad by scraping the public product page
 */
async function fetchProductData(productId) {
  try {
    const url = `https://gumroad.com/l/${productId}`;
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProductDataFetcher/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract Open Graph meta tags (most reliable)
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    
    // Try multiple price extraction methods
    let price = 'See on Gumroad';
    
    // Method 1: Look for price in various formats
    const pricePatterns = [
      /data-price=["']([^"']+)["']/i,
      /["']price["']:\s*["']([^"']+)["']/i,
      /\$(\d+(?:\.\d{2})?)/,
      /price["']:\s*(\d+)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        price = match[1].startsWith('$') ? match[1] : `$${match[1]}`;
        break;
      }
    }
    
    // Clean up extracted data
    const title = ogTitleMatch?.[1]?.replace(/&quot;/g, '"').replace(/&#39;/g, "'") || `Product ${productId}`;
    const image = ogImageMatch?.[1] || null;
    const description = ogDescMatch?.[1]?.replace(/&quot;/g, '"').replace(/&#39;/g, "'") || '';
    
    const productData = {
      id: productId,
      title: title,
      price: price,
      image: image,
      description: description,
      url: url,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`✅ ${productId}: ${title} - ${price}`);
    return productData;
    
  } catch (error) {
    console.error(`❌ Error fetching product ${productId}:`, error.message);
    
    // Return fallback data with known titles for your products
    const fallbackTitles = {
      'motivation33': '33 Affirmations to Keep You Motivated',
      'mornings33': '33 Tips for Your Morning Routine', 
      'freshstart50': '50 Ways to Get a Fresh Start'
    };
    
    return {
      id: productId,
      title: fallbackTitles[productId] || `Product ${productId}`,
      price: 'See on Gumroad',
      image: null,
      description: '',
      url: `https://gumroad.com/l/${productId}`,
      lastUpdated: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Fetches all product data and saves to JSON file
 */
async function fetchAllProducts() {
  console.log('Fetching Gumroad product data...');
  
  const products = [];
  
  for (const productId of PRODUCT_IDS) {
    console.log(`Fetching ${productId}...`);
    const productData = await fetchProductData(productId);
    products.push(productData);
    
    // Be nice to Gumroad's servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), 'src', 'data');
  await fs.mkdir(dataDir, { recursive: true });
  
  // Save to JSON file
  const filePath = path.join(dataDir, 'gumroad-products.json');
  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  
  console.log(`✅ Saved ${products.length} products to ${filePath}`);
  console.log('Products:', products.map(p => `${p.title} - ${p.price}`).join(', '));
  
  return products;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAllProducts().catch(console.error);
}

export { fetchAllProducts, fetchProductData };