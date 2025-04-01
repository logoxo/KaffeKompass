<script setup>
// Wichtige Nuxt-Hooks importieren
import { useMenuStore } from '~/stores/useMenuStore';
const route = useRoute();
const slug = route.params.slug;

// Pinia-Store initialisieren
const menuStore = useMenuStore();

// Lokale reaktive Zustände
const localLoading = ref(true);

// SEO setup
const { $setSeo, $generateSeoTags } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const baseUrl = runtimeConfig.public.siteUrl || '';

// Beim Montieren der Komponente Daten laden
onMounted(async () => {
  localLoading.value = true;
  
  // Café-Daten laden
  await menuStore.fetchCafeBySlug(slug);
  
  localLoading.value = false;
  
  // Set SEO tags once café data is loaded
  if (cafeData.value) {
    setSeoForCafe(cafeData.value);
  }
});

// Café-Daten aus dem Store abrufen
const cafeData = computed(() => menuStore.getCurrentCafe(slug));

// Menüdaten aus dem Store abrufen
const menuCategories = computed(() => menuStore.getMenuForCafe(slug));

// SEO Konfiguration basierend auf Café-Daten
const setSeoForCafe = (cafe) => {
  if (!cafe) return;
  
  const cafeName = cafe.shop_name || '';
  const cafeCity = cafe.address?.city || '';
  const cafeImage = cafe.shop_img && cafe.shop_img.length > 0 ? cafe.shop_img[0].url : '/assets/img/background.png';
  
  const seoTags = $generateSeoTags({
    title: `${cafeName} | Menükarte und Informationen`,
    description: `Entdecken Sie die Menükarte und Informationen von ${cafeName} in ${cafeCity}. Öffnungszeiten, Adresse und vieles mehr.`,
    keywords: `${cafeName}, café, ${cafeCity}, menükarte, speisekarte, kaffee`,
    image: cafeImage,
    canonical: `/menu/${slug}`,
    ogType: 'business.business',
    twitterCard: 'summary_large_image'
  });
  
  // Füge strukturierte Daten (JSON-LD) hinzu
  const jsonLd = {
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          name: cafeName,
          image: cafeImage,
          address: {
            '@type': 'PostalAddress',
            streetAddress: cafe.address?.street || '',
            addressLocality: cafeCity,
            postalCode: cafe.address?.zipcode || '',
            addressCountry: 'DE'
          },
          servesCuisine: 'Café',
          priceRange: '$$',
          url: `${baseUrl}/menu/${slug}`
        })
      }
    ]
  };
  
  // Setze SEO-Tags inklusive structured data
  useHead({
    ...seoTags,
    ...jsonLd
  });
  
  // Standardmäßige SEO-Tags setzen
  $setSeo(seoTags);
};

// Reagiere auf Änderungen des Slug-Parameters
watch(() => route.params.slug, (newSlug) => {
  if (newSlug && newSlug !== slug) {
    localLoading.value = true;
    menuStore.fetchCafeBySlug(newSlug).finally(() => {
      localLoading.value = false;
      
      // Update SEO when café changes
      if (cafeData.value) {
        setSeoForCafe(cafeData.value);
      }
    });
  }
});

// Beobachte Änderungen an den Café-Daten für SEO-Updates
watch(cafeData, (newData) => {
  if (newData) {
    setSeoForCafe(newData);
  }
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header mit Café-Name -->
    <div class="bg-[#272121] py-16 text-center">
      <div v-if="localLoading || menuStore.loading" class="text-white">
        <p>Laden...</p>
      </div>
      <div v-else-if="menuStore.error && !cafeData" class="text-white">
        <p>{{ menuStore.error }}</p>
      </div>
      <div v-else-if="cafeData">
        <h1 class="text-white text-5xl font-light">{{ cafeData.shop_name }}</h1>
        <p class="text-white mt-2" v-if="cafeData.address">
          {{ cafeData.address.street }}, {{ cafeData.address.zipcode }} {{ cafeData.address.city }}
        </p>
      </div>
      <div v-else class="text-white">
        <p>Café nicht gefunden</p>
      </div>
    </div>

    <!-- Menu content with white background -->
    <div class="bg-[#FAF9F6] flex-grow p-6 md:p-12 rounded-t-3xl -mt-4">
      <!-- Loading -->
      <div v-if="localLoading || menuStore.loading" class="flex justify-center items-center h-32">
        <p class="text-gray-600">Menü wird geladen...</p>
      </div>
      
      <!-- Menü oder Fehler anzeigen -->
      <div v-else class="max-w-4xl mx-auto">
        <!-- Zurück-Button -->
        <div class="mb-6">
          <NuxtLink to="/" class="text-[#cc785c] hover:text-[#a66249] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Zurück zur Übersicht
          </NuxtLink>
        </div>
        
        <!-- Fehlermeldung für fehlende Menüdaten -->
        <div v-if="menuStore.error && menuCategories.length === 0" class="text-center py-8 bg-red-50 rounded-lg p-4">
          <p class="text-gray-700 text-xl mb-2">{{ menuStore.error }}</p>
        </div>
        
        <!-- Keine Menüdaten gefunden -->
        <div v-else-if="menuCategories.length === 0" class="text-center py-8">
          <p class="text-gray-700 text-xl mb-2">Wir arbeiten an der Menukarte</p>
          <p class="text-gray-600">Sie wird bald verfügbar sein.</p>
          <div class="mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-[#cc785c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        
        <!-- Menu categories -->
        <div v-for="category in menuCategories" :key="category.id" class="mb-10">
          <h2 class="text-black text-xl font-bold mb-4">{{ category.title }}</h2>
          
          <!-- Keine Menüpunkte in dieser Kategorie -->
          <div v-if="!category.items || category.items.length === 0" class="text-gray-600 italic">
            Keine Einträge in dieser Kategorie.
          </div>
          
          <!-- Menu items mit Weißen Hintergrund -->
          <div 
            v-for="item in category.items" 
            :key="item.id"
            class="rounded-lg mb-3 p-4 flex justify-between items-start bg-white"
          >
            <div>
              <div class="flex items-center">
                <span class="text-black font-medium">{{ item.name }}</span>
              </div>
              <!-- Description if exists -->
              <p v-if="item.description" class="text-black text-sm mt-1">{{ item.description }}</p>
              <!-- Tags like "vegan" -->
              <div v-if="item.tags && item.tags.length > 0" class="mt-1">
                <span 
                  v-for="(tag, tagIndex) in item.tags" 
                  :key="tagIndex"
                  class="inline-block bg-[#cc785c] text-white text-xs px-2 py-1 rounded mr-2"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            <span class="text-black font-bold">{{ item.price }}</span>
          </div>
        </div>
        
        <!-- Debug Informationen - immer anzeigen, aber unauffällig -->
        <div class="mt-8 p-4 bg-gray-100 rounded text-xs">
          <details>
            <summary class="cursor-pointer font-bold">Debug-Informationen anzeigen</summary>
            <div class="mt-2">
              <h4 class="font-bold">Log-Einträge:</h4>
              <ul class="list-disc pl-5 mt-1">
                <li v-for="(log, index) in menuStore.debug.logs" :key="'log-'+index">{{ log }}</li>
              </ul>
              
              <h4 class="font-bold mt-4" v-if="menuStore.debug.errors.length > 0">Fehler:</h4>
              <ul class="list-disc pl-5 mt-1 text-red-600" v-if="menuStore.debug.errors.length > 0">
                <li v-for="(err, index) in menuStore.debug.errors" :key="'err-'+index">{{ err }}</li>
              </ul>
              
              <h4 class="font-bold mt-4">Rohdaten aus dem Store:</h4>
              <div class="mt-1 overflow-auto max-h-40">
                <strong>Café:</strong>
                <pre>{{ JSON.stringify(cafeData, null, 2) }}</pre>
                
                <strong>Menü:</strong>
                <pre>{{ JSON.stringify(menuCategories, null, 2) }}</pre>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Theme colors */
.bg-brown-800 {
  background-color: #3D2B1F; /* Ein deutlicherer Braunton */
}

/* Animation für Menüpunkte */
.rounded-lg {
  transition: all 0.2s ease-in-out;
}

.rounded-lg:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>