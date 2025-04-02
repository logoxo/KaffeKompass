// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt", "@nuxtjs/strapi"],
  devServer: {
    host: '0.0.0.0', // Erlaubt den Zugriff von externen Quellen
    port: 3000, // Falls dein Nuxt-Server auf Port 3000 läuft
    allowedHosts: ["c468-2001-9e8-44dc-df00-a5da-32c6-d275-d1be.ngrok-free.app"] // Erlaubt alle Hosts, einschließlich Ngrok
  },
  css: [
    // SCSS file in the project
    "~/assets/scss/main.scss", // you should add main.scss somewhere in your app
  ],
  strapi: {
    url: 'http://localhost:1337', // Replace with your Strapi URL
    prefix: '/api',
  },
  runtimeConfig: {
    // Keys within public are also exposed client-side
    public: {
      strapi: {
        url: process.env.STRAPI_URL || 'http://localhost:1337',
        // ... other existing Strapi config
      },
      siteUrl: process.env.SITE_URL || 'https://cafefinder.de',
      siteName: process.env.SITE_NAME || 'Café Finder',
      siteDescription: process.env.SITE_DESCRIPTION || 'Entdecken Sie die besten Cafés in Ihrer Stadt. Menükarten, Öffnungszeiten und mehr.',
      siteLanguage: process.env.SITE_LANGUAGE || 'de',
    }
  },
  
  // SEO configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Café Finder',
      meta: [
        { name: 'description', content: 'Entdecken Sie die besten Cafés in Ihrer Stadt. Menükarten, Öffnungszeiten und mehr.' },
        { name: 'format-detection', content: 'telephone=no' },
        // Default social meta tags
        { property: 'og:site_name', content: 'Café Finder' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  // Generate routes at build time
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt']
    }
  }
})
