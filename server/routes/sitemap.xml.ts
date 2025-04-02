// server/routes/sitemap.xml.ts
import { SitemapStream, streamToPromise } from 'sitemap'
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

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
  
  // Add static pages
  sitemap.write({
    url: '/impressum',
    changefreq: 'monthly',
    priority: 0.5
  });
  
  sitemap.write({
    url: '/kontakt',
    changefreq: 'monthly',
    priority: 0.7
  });
  
  // Add menu items pages
  const menuItems = [
    'espresso',
    'cappuccino',
    'latte', 
    'americano',
    'macchiato',
    'example'
  ];
  
  menuItems.forEach(item => {
    sitemap.write({
      url: `/menu/${item}`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: new Date().toISOString()
    });
  });
  
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