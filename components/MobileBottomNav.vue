<template>
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white text-gray-700 border-t border-gray-300 shadow-lg">
      <div class="grid grid-cols-4 h-16">
        <!-- Home-Button -->
        <NuxtLink to="/" @click.prevent="navigateToHome" class="flex flex-col items-center justify-center hover:bg-gray-100">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <!-- Notification dot - could be used for unread items -->
            <!-- <div class="absolute -top-1 -right-1 h-2.5 w-2.5 bg-[#cc785c] rounded-full"></div> -->
          </div>
          <span class="text-xs mt-1 font-medium" :class="{'text-[#cc785c]': $route.path === '/'}">Home</span>
        </NuxtLink>
  
        <!-- Menu Button -->
        <button @click="toggleMobileMenu" class="flex flex-col items-center justify-center hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span class="text-xs mt-1 font-medium" :class="{'text-[#cc785c]': mobileMenuOpen}">Menu</span>
        </button>
  
        <!-- Impressum Link -->
        <NuxtLink to="/impressum" class="flex flex-col items-center justify-center hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs mt-1 font-medium" :class="{'text-[#cc785c]': $route.path === '/impressum'}">Impressum</span>
        </NuxtLink>
  
        <!-- Kontakt Link -->
        <NuxtLink to="/kontakt" class="flex flex-col items-center justify-center hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span class="text-xs mt-1 font-medium" :class="{'text-[#cc785c]': $route.path === '/kontakt'}">Kontakt</span>
        </NuxtLink>
      </div>
  
      <!-- Mobile Menu Panel (slides from top) -->
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-50 bg-white flex flex-col"
        @click.self="closeMobileMenu"
      >
        <!-- Header with title and close button -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-[#FAF9F6]">
          <div class="flex items-center">
            <img src="~/assets/logo.png" alt="Logo" class="h-8 w-8 mr-2" />
            <h1 class="text-lg font-medium text-gray-800">CafeKompass</h1>
          </div>
          <button @click="closeMobileMenu" class="text-gray-700 p-2 rounded-full hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
  
        <!-- Search bar for mobile -->
        <div class="p-4 bg-[#FAF9F6] border-b border-gray-200">
          <div class="relative">
            <input 
              v-model="searchText"
              @input="handleSearch"
              @focus="onSearchFocus" 
              type="text" 
              placeholder="Städte, Stadtteile, Cafés oder PLZ suchen..." 
              class="w-full py-2 pl-10 pr-4 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div v-if="searchText" @click="clearSearch" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          <!-- Mobile Search Results -->
          <div v-if="hasSearchResults" class="mt-2">
            <!-- Postleitzahlen -->
            <div v-if="store.searchResults.zipCodes && store.searchResults.zipCodes.length > 0" class="mb-3">
              <div class="text-xs font-medium text-gray-500 uppercase mb-1">Postleitzahlen</div>
              <div class="bg-white rounded-md shadow-sm">
                <div v-for="(item, index) in store.searchResults.zipCodes" 
                     :key="`mobile-zip-${index}`" 
                     @click="selectSearchResult('zipCode', item)"
                     class="px-3 py-2 border-b border-gray-100 last:border-b-0 active:bg-gray-50">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div class="font-medium">{{ item.zipCode }}</div>
                      <div class="text-xs text-gray-500">{{ item.city }}{{ item.section ? ', ' + item.section : '' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Städte -->
            <div v-if="store.searchResults.cities.length > 0" class="mb-3">
              <div class="text-xs font-medium text-gray-500 uppercase mb-1">Städte</div>
              <div class="bg-white rounded-md shadow-sm">
                <div v-for="(city, index) in store.searchResults.cities" 
                     :key="`mobile-city-${index}`" 
                     @click="selectSearchResult('city', city)"
                     class="px-3 py-2 border-b border-gray-100 last:border-b-0 active:bg-gray-50 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ city }}</span>
                </div>
              </div>
            </div>
            
            <!-- Stadtteile -->
            <div v-if="store.searchResults.sections.length > 0" class="mb-3">
              <div class="text-xs font-medium text-gray-500 uppercase mb-1">Stadtteile</div>
              <div class="bg-white rounded-md shadow-sm">
                <div v-for="(section, index) in store.searchResults.sections" 
                     :key="`mobile-section-${index}`"
                     @click="selectSearchResult('section', section)"
                     class="px-3 py-2 border-b border-gray-100 last:border-b-0 active:bg-gray-50 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <span>{{ section }}</span>
                </div>
              </div>
            </div>
            
            <!-- Cafés -->
            <div v-if="store.searchResults.cafes.length > 0" class="mb-3">
              <div class="text-xs font-medium text-gray-500 uppercase mb-1">Cafés</div>
              <div class="bg-white rounded-md shadow-sm">
                <div v-for="(cafe, index) in store.searchResults.cafes" 
                     :key="`mobile-cafe-${cafe.id}`"
                     @click="selectSearchResult('cafe', cafe)"
                     class="px-3 py-2 border-b border-gray-100 last:border-b-0 active:bg-gray-50">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <div class="font-medium">{{ cafe.name }}</div>
                      <div class="text-xs text-gray-500" v-if="cafe.address">
                        {{ cafe.address.city }}{{ cafe.address.city_section ? ', ' + cafe.address.city_section : '' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Keine Ergebnisse -->
            <div v-if="!hasSearchResults && searchText.length > 0" class="text-center text-gray-500 py-3 bg-white rounded-md">
              Keine Ergebnisse gefunden für "{{ searchText }}"
            </div>
          </div>
        </div>
  
        <!-- Menu content -->
        <div class="flex-1 overflow-y-auto px-4 py-2 bg-white">
          <div class="space-y-6">
            <!-- Stadt-Auswahl -->
            <div>
              <h2 class="text-lg font-medium mb-3 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Stadt
              </h2>
              <div class="bg-gray-50 rounded-lg">
                <div
                  v-for="city in store.availableCities"
                  :key="city"
                  @click="selectCity(city)"
                  class="py-3 px-4 rounded-md cursor-pointer transition-colors active:bg-gray-200 mb-1 relative border-l-4"
                  :class="{ 'border-[#cc785c] bg-gray-100': city === store.currentCity, 'border-transparent': city !== store.currentCity }"
                >
                  <span class="text-gray-700 font-medium">{{ city }}</span>
                  <div v-if="city === store.currentCity" class="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#cc785c]" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Stadtteile-Auswahl -->
            <div>
              <h2 class="text-lg font-medium mb-3 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Stadtteil
              </h2>
              <div class="bg-gray-50 rounded-lg">
                <div
                  v-for="section in store.citySections"
                  :key="section"
                  @click="selectSection(section)"
                  class="py-3 px-4 rounded-md cursor-pointer transition-colors active:bg-gray-200 mb-1 relative border-l-4"
                  :class="{ 'border-[#cc785c] bg-gray-100': section === store.currentSection, 'border-transparent': section !== store.currentSection }"
                >
                  <span class="text-gray-700 font-medium">{{ section }}</span>
                  <div v-if="section === store.currentSection" class="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#cc785c]" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div v-if="!store.citySections.length" class="py-3 px-4 text-gray-500 italic text-sm">
                  Keine Stadtteile verfügbar
                </div>
              </div>
            </div>
  
            <!-- Cafés-Bereich wurde entfernt -->
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const store = useStore();
  const mobileMenuOpen = ref(false);
  const searchText = ref('');
  const searchDebounceTimeout = ref(null);
  
  // Computed property for available cafes (products)
  const availableCafes = computed(() => {
    return store.posts.filter(post => post.kind === 'Product');
  });
  
  // Computed property für Suchergebnisse
  const hasSearchResults = computed(() => {
    return (store.searchResults.zipCodes && store.searchResults.zipCodes.length > 0) || 
           store.searchResults.cities.length > 0 || 
           store.searchResults.sections.length > 0 || 
           store.searchResults.cafes.length > 0;
  });
  
  // Suchfunktionen
  function handleSearch() {
    if (searchDebounceTimeout.value) {
      clearTimeout(searchDebounceTimeout.value);
    }
    
    searchDebounceTimeout.value = setTimeout(() => {
      store.search(searchText.value);
    }, 300);
  }
  
  function clearSearch() {
    searchText.value = '';
    store.search('');
  }
  
  async function onSearchFocus() {
    searchText.value = '';
    store.search('');
    
    // Zurücksetzen der Produkte auf den Anfangszustand
    // Nur Stadt beibehalten, aber Stadtteil und Café zurücksetzen
    if (store.currentSection || store.currentCafe) {
      store.currentSection = null;
      store.currentCafe = null;
      await store.fetchPosts({ city: store.currentCity });
    }
  }
  
  // Suchergebnis auswählen
  function selectSearchResult(type, value) {
    store.navigateToSearchResult(type, value);
    searchText.value = '';
    closeMobileMenu();
  }
  
  // Methods for navigation
  const navigateToHome = async () => {
    await store.navigateToHome();
    closeMobileMenu();
  };
  
  const selectCity = async (city) => {
    await store.navigateToCity(city);
    closeMobileMenu();
  };
  
  const selectSection = async (section) => {
    await store.navigateToSection(section);
    closeMobileMenu();
  };
  
  const selectCafe = (cafe) => {
    store.setCurrentCafe(cafe);
    closeMobileMenu();
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
    
    // Prevent body scrolling when menu is open
    if (mobileMenuOpen.value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  // Close mobile menu
  const closeMobileMenu = () => {
    mobileMenuOpen.value = false;
    document.body.style.overflow = '';
  };
  
  // Close menu on escape key
  const handleEscKey = (event) => {
    if (event.key === 'Escape' && mobileMenuOpen.value) {
      closeMobileMenu();
    }
  };
  
  onMounted(() => {
    document.addEventListener('keydown', handleEscKey);
  });
  
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscKey);
    // Ensure body scroll is restored
    document.body.style.overflow = '';
  });
  </script>
  
  <style scoped>
  /* Animation for menu */
  .fixed {
    transition: transform 0.3s ease;
  }
  </style>