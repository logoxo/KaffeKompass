<template>
    <div class="container max-w-full bg-color-wrapper">
        <section class="sticky top-0 z-50 bg-white" id="header">   
          <Header />
        </section>
        <section id="content" class="min-h-screen pb-mobile-nav">
            <slot />
        </section>
        <section id="footer">
        </section>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

const store = useStore();
const runtimeConfig = useRuntimeConfig();
const baseUrl = runtimeConfig.public.siteUrl || '';

// Default SEO setup for all pages
useHead({
  htmlAttrs: {
    lang: 'de',
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'format-detection', content: 'telephone=no' },
    { property: 'og:locale', content: 'de-DE' },
  ],
  // Add site-wide structured data for the website
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Café Finder',
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      })
    }
  ]
});

onMounted(async () => {
  // Initialisiere die Navigation beim Starten der App
  await store.initNavigation();
  
  // Lade anfängliche Daten
  await store.fetchPosts({ city: store.currentCity });
});
</script>

<style>
/* Padding für den Hauptinhalt auf mobilen Geräten */
@media (max-width: 767px) {
  .pb-mobile-nav {
    padding-bottom: 5rem; /* Entspricht ungefähr der Höhe der mobilen Navigation (4rem) plus etwas Platz */
  }
}
</style>