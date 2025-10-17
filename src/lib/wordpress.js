import { getCached } from './cache.js';

const WP_GRAPHQL_URL = 'https://dragosroua.com/graphql';
const IS_DEV = import.meta.env.DEV;
const DEV_POST_LIMIT = 500; // Only fetch 50 posts in dev mode

async function fetchGraphQL(query, variables = {}) {
  console.log('🔍 Fetching from GraphQL...');
  
  try {
    const response = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error:', response.status);
      console.error('❌ Response:', errorText);
      throw new Error(`GraphQL HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    
    if (json.errors) {
      console.error('❌ GraphQL Errors:');
      json.errors.forEach(err => {
        console.error('  -', err.message);
        if (err.locations) {
          console.error('    Line:', err.locations[0].line);
        }
      });
      console.error('\nFull error:', JSON.stringify(json.errors, null, 2));
      throw new Error('GraphQL query failed: ' + json.errors[0].message);
    }

    return json.data;
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    throw error;
  }
}

// Get all posts with pagination (handles 1,376 posts)
export async function getAllPosts() {
  return getCached('all-posts', async () => {
    let allPosts = [];
    let hasNextPage = true;
    let endCursor = null;
    let pageCount = 0;

    console.log(IS_DEV 
      ? `\n📚 DEV MODE: Fetching first ${DEV_POST_LIMIT} posts...\n`
      : '\n📚 PRODUCTION: Fetching all posts...\n'
    );

    while (hasNextPage) {
      // In dev mode, stop after reaching limit
      if (IS_DEV && allPosts.length >= DEV_POST_LIMIT) {
        console.log(`✓ Reached dev limit of ${DEV_POST_LIMIT} posts\n`);
        break;
      }
      
      const query = `
        query GetAllPosts($after: String) {
          posts(first: 100, after: $after, where: {status: PUBLISH}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
                id
                databaseId
                title
                slug
                uri
                content
                date
                modified
                featuredImage {
                    node {
                    sourceUrl
                    altText
                    mediaDetails {
                        width
                        height
                        sizes {
                            sourceUrl
                            name
                            width
                            height
                        }
                    }
                    }
                }
                seo {
                    title
                    metaDesc
                    canonical
                    opengraphTitle
                    opengraphDescription
                    opengraphImage {
                    sourceUrl
                    }
                    schema {
                    raw
                    }
                }
                tags {
                    nodes {
                    id
                    name
                    slug
                    }
                }
                categories {
                    nodes {
                    id
                    name
                    slug
                    }
                }
            }
          }
        }
      `;

      const data = await fetchGraphQL(query, { after: endCursor });
      
      allPosts = [...allPosts, ...data.posts.nodes];
      hasNextPage = data.posts.pageInfo.hasNextPage;
      endCursor = data.posts.pageInfo.endCursor;
      pageCount++;
      
      console.log(`  ✓ Batch ${pageCount}: ${data.posts.nodes.length} posts (total: ${allPosts.length})`);
    }

    console.log(`\n✓ Fetched ${allPosts.length} total posts\n`);
    
    // Filter out posts without content
    const validPosts = allPosts.filter(post => {
      if (!post.content) {
        console.warn(`⚠️  Skipping post "${post.title}" - no content`);
        return false;
      }
      return true;
    });
    
    console.log(`✓ ${validPosts.length} posts have content\n`);
    return validPosts;
  });
}

// Get all pages with pagination
export async function getAllPages() {
  return getCached('all-pages', async () => {
    let allPages = [];
    let hasNextPage = true;
    let endCursor = null;

    console.log('📄 Fetching all pages from WordPress...\n');

    while (hasNextPage) {
      const query = `
        query GetAllPages($after: String) {
          pages(first: 100, after: $after, where: {status: PUBLISH}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              databaseId
              title
              slug
              uri
              content
              date
              modified
              featuredImage {
                node {
                    sourceUrl          # Full size
                    altText
                    mediaDetails {
                    width
                    height
                    sizes {
                        sourceUrl
                        name
                        width
                        height
                    }
                    }
                }
              }
              seo {
                title
                metaDesc
                canonical
                opengraphTitle
                opengraphDescription
                opengraphImage {
                  sourceUrl
                }
                schema {
                  raw
                }
              }
            }
          }
        }
      `;

      const data = await fetchGraphQL(query, { after: endCursor });
      
      allPages = [...allPages, ...data.pages.nodes];
      hasNextPage = data.pages.pageInfo.hasNextPage;
      endCursor = data.pages.pageInfo.endCursor;
    }

    console.log(`✓ Fetched ${allPages.length} pages\n`);
    
    const validPages = allPages.filter(page => {
      if (!page.content) {
        console.warn(`⚠️  Skipping page "${page.title}" - no content`);
        return false;
      }
      return true;
    });
    
    return validPages;
  });
}

// Helper to extract slug from URI
export function getSlugFromUri(uri) {
  // Remove leading slash, keep structure
  return uri.replace(/^\//, '');
}

// Get all tags
export async function getAllTags() {
  return getCached('all-tags', async () => {
    let allTags = [];
    let hasNextPage = true;
    let endCursor = null;

    console.log('🏷️  Fetching all tags...\n');

    while (hasNextPage) {
      const query = `
        query GetAllTags($after: String) {
          tags(first: 100, after: $after, where: {hideEmpty: true}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              name
              slug
              count
              description
            }
          }
        }
      `;

      const data = await fetchGraphQL(query, { after: endCursor });
      
      allTags = [...allTags, ...data.tags.nodes];
      hasNextPage = data.tags.pageInfo.hasNextPage;
      endCursor = data.tags.pageInfo.endCursor;
    }

    console.log(`✓ Fetched ${allTags.length} tags\n`);
    return allTags;
  });
}

// Get all categories
export async function getAllCategories() {
  return getCached('all-categories', async () => {
    let allCategories = [];
    let hasNextPage = true;
    let endCursor = null;

    console.log('📁 Fetching all categories...\n');

    while (hasNextPage) {
      const query = `
        query GetAllCategories($after: String) {
          categories(first: 100, after: $after, where: {hideEmpty: true}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              name
              slug
              count
              description
            }
          }
        }
      `;

      const data = await fetchGraphQL(query, { after: endCursor });
      
      allCategories = [...allCategories, ...data.categories.nodes];
      hasNextPage = data.categories.pageInfo.hasNextPage;
      endCursor = data.categories.pageInfo.endCursor;
    }

    console.log(`✓ Fetched ${allCategories.length} categories\n`);
    return allCategories;
  });
}

// Get posts by tag slug
export async function getPostsByTag(tagSlug) {
  const posts = await getAllPosts();
  // We'll need to add tags to post query first
  return posts.filter(post => 
    post.tags?.nodes?.some(tag => tag.slug === tagSlug)
  );
}

// Get posts by category slug
export async function getPostsByCategory(categorySlug) {
  const posts = await getAllPosts();
  // We'll need to add categories to post query first
  return posts.filter(post => 
    post.categories?.nodes?.some(cat => cat.slug === categorySlug)
  );
}