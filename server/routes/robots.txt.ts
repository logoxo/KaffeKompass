// server/routes/robots.txt.ts
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const siteUrl = config.public.siteUrl || 'https://cafefinder.de';
  
  // Create robots.txt content
  const robotsConfig = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join('\n');
  
  // Set content type and cache control
  event.node.res.setHeader('Content-Type', 'text/plain');
  event.node.res.setHeader('Cache-Control', 'max-age=86400, s-maxage=86400');
  
  // Return the robots.txt content
  return robotsConfig;
});