// server/routes/sitemap.xml.ts
import { serverQueryContent } from '#content/server'
import { SitemapStream, streamToPromise } from 'sitemap'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // Fetch base URL from runtime config
  const config = useRuntimeConfig();
  const baseURL = config.public.siteUrl || 'https://cafefinder.de';
  
  // Create sitemap stream
  const sitemap = new SitemapStream({
    hostname: baseURL
  });
  
  // Add home page
  sitemap.write({
    url: '/',
    changefreq: 'daily',
    priority: 1.0
  });
  
  // Fetch all cafes from API to generate URLs
  const { find } = useStrapi();
  
  try {
    // Get all cafes with their slugs
    const { data, error } = await find('posts', {
      fields: ['id', 'slug', 'updatedAt'],
      populate: {
        address: {
          fields: ['city', 'city_section']
        }
      }
    });
    
    if (error) {
      throw new Error(`Failed to fetch cafes: ${error.message}`);
    }
    
    // Get all available cities from the data
    const cities = [...new Set(data.map(post => post.address?.city).filter(Boolean))];
    
    // Add city pages to sitemap
    cities.forEach(city => {
      sitemap.write({
        url: `/city/${city}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString()
      });
      
      // Get city sections for this city
      const citySections = [...new Set(
        data
          .filter(post => post.address?.city === city)
          .map(post => post.address?.city_section)
          .filter(Boolean)
      )];
      
      // Add city section pages to sitemap
      citySections.forEach(section => {
        sitemap.write({
          url: `/city/${city}/section/${section}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: new Date().toISOString()
        });
      });
    });
    
    // Add all cafe detail pages to sitemap
    data.forEach(cafe => {
      if (cafe.slug) {
        sitemap.write({
          url: `/menu/${cafe.slug}`,
          changefreq: 'weekly',
          priority: 0.9,
          lastmod: cafe.updatedAt || new Date().toISOString()
        });
      }
    });
  } catch (e) {
    console.error(e);
  }
  
  // End the sitemap stream
  sitemap.end();
  
  // Generate XML from stream
  const xml = await streamToPromise(sitemap);
  
  // Set appropriate headers
  event.node.res.setHeader('Content-Type', 'application/xml');
  event.node.res.setHeader('Cache-Control', 'max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
  
  // Return the XML as string
  return xml.toString();
});