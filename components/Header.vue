<template>
  <div>
    <!-- Zoom-ähnliche Navigationsleiste -->
    <div class="bg-[#FAF9F6] text-black border-b border-gray-300 py-0 relative h-[70px] flex items-center justify-between">
      <!-- Logo und Titel - links -->
      <div class="flex items-center px-4">
        <NuxtLink to="/" @click.prevent="navigateToHome" class="flex items-center text-gray-700 hover:text-black transition-colors">
          <img src="~/assets/logo.png" alt="Logo" class="h-8 w-8 mr-2" />
          <span class="ml-1 font-medium text-lg">CafeKompass</span>
        </NuxtLink>
      </div>
      
      <!-- Suchfeld in der Mitte (nur Desktop) -->
      <div class="hidden md:block max-w-md w-full px-4">
        <div class="relative" data-menu="search">
          <input 
            ref="searchInput"
            v-model="searchText"
            @input="handleSearch" 
            @focus="onSearchFocus"
            @keyup.enter="selectFirstResult"
            @keyup.down="navigateSearchResults(1)" 
            @keyup.up="navigateSearchResults(-1)"
            type="text" 
            placeholder="Städte, Stadtteile, Cafés oder PLZ suchen..." 
            class="w-full py-2 pl-10 pr-8 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 text-sm"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-gray-500">
            <span class="bg-gray-200 px-1.5 py-0.5 rounded">⌘K</span>
          </div>
          
          <!-- Suchergebnisse Dropdown -->
          <div v-if="searchFocused && hasSearchResults" 
              data-content="search"
              class="absolute top-full left-0 right-0 bg-white rounded-md border border-gray-300 shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
            
            <!-- Postleitzahlen -->
            <div v-if="store.searchResults.zipCodes && store.searchResults.zipCodes.length > 0" class="p-2">
              <div class="text-xs font-medium text-gray-500 uppercase mb-1 px-2">Postleitzahlen</div>
              <div v-for="(item, index) in store.searchResults.zipCodes" 
                   :key="`zip-${index}`" 
                   @click="selectSearchResult('zipCode', item)"
                   :class="{ 'bg-gray-100': selectedSearchIndex === getResultIndexOffset('zipCode', index) }"
                   class="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div class="flex flex-col">
                  <span class="text-black font-medium">{{ item.zipCode }}</span>
                  <span class="text-xs text-gray-500">{{ item.city }}{{ item.section ? ', ' + item.section : '' }}</span>
                </div>
              </div>
            </div>
            
            <!-- Städte -->
            <div v-if="store.searchResults.cities.length > 0" class="p-2" :class="{'border-t border-gray-200': store.searchResults.zipCodes && store.searchResults.zipCodes.length > 0}">
              <div class="text-xs font-medium text-gray-500 uppercase mb-1 px-2">Städte</div>
              <div v-for="(city, index) in store.searchResults.cities" 
                   :key="`city-${index}`" 
                   @click="selectSearchResult('city', city)"
                   :class="{ 'bg-gray-100': selectedSearchIndex === getResultIndexOffset('city', index) }"
                   class="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-black">{{ city }}</span>
              </div>
            </div>
            
            <!-- Stadtteile -->
            <div v-if="store.searchResults.sections.length > 0" class="p-2 border-t border-gray-200">
              <div class="text-xs font-medium text-gray-500 uppercase mb-1 px-2">Stadtteile</div>
              <div v-for="(section, index) in store.searchResults.sections" 
                   :key="`section-${index}`"
                   @click="selectSearchResult('section', section)"
                   :class="{ 'bg-gray-100': selectedSearchIndex === getResultIndexOffset('section', index) }"
                   class="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span>{{ section }}</span>
              </div>
            </div>
            
            <!-- Cafés -->
            <div v-if="store.searchResults.cafes.length > 0" class="p-2 border-t border-gray-200">
              <div class="text-xs font-medium text-gray-500 uppercase mb-1 px-2">Cafés</div>
              <div v-for="(cafe, index) in store.searchResults.cafes" 
                   :key="`cafe-${cafe.id}`"
                   @click="selectSearchResult('cafe', cafe)"
                   :class="{ 'bg-gray-100': selectedSearchIndex === getResultIndexOffset('cafe', index) }"
                   class="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <div>{{ cafe.name }}</div>
                  <div class="text-xs text-gray-500" v-if="cafe.address">
                    {{ cafe.address.city }}{{ cafe.address.city_section ? ', ' + cafe.address.city_section : '' }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Keine Ergebnisse -->
            <div v-if="!hasSearchResults && searchText.length > 0" class="p-4 text-center text-gray-500">
              Keine Ergebnisse gefunden für "{{ searchText }}"
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile header title - shows current location -->
      <div class="md:hidden text-center flex-1">
        <h1 class="text-lg font-medium truncate">
          <span>{{ store.currentCity }}</span>
          <span v-if="store.currentSection" class="mx-1">
            &gt; {{ store.currentSection }}
          </span>
          <span v-if="store.currentCafe" class="mx-1">
            &gt; {{ truncateText(store.currentCafe.shop_name, 15) }}
          </span>
        </h1>
      </div>
      
      <!-- Impressum und Kontakt Links - rechts -->
      <div class="flex items-center px-4 space-x-2">
        <NuxtLink to="/impressum" class="p-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors">
          <span class="hidden md:inline">Impressum</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </NuxtLink>
        <NuxtLink to="/kontakt" class="p-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors">
          <span class="hidden md:inline">Kontakt</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </NuxtLink>
      </div>
    </div>
    
    <!-- Zoom-ähnliche Hauptnavigation - nur auf Desktop sichtbar -->
    <div class="hidden md:block bg-[#FAF9F6] shadow-sm border-b border-gray-300">
      <div class="container mx-auto flex justify-center">
        <div class="flex items-center">
          <!-- Home Button wurde entfernt -->
          
          <!-- Städte -->
          <div 
            @click="toggleCityDropdown" 
            data-menu="city"
            class="flex flex-col items-center py-3 px-6 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer relative"
            :class="{'text-[#cc785c]': cityDropdownOpen}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="mt-1 text-sm">{{ store.currentCity }}</span>
            <!-- Active indicator dot -->
            <div v-if="cityDropdownOpen" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-10 bg-[#cc785c] rounded-t"></div>
          </div>
          
          <!-- Stadtteile -->
          <div 
            @click="toggleSectionDropdown" 
            v-if="store.citySections.length > 0"
            data-menu="section"
            class="flex flex-col items-center py-3 px-6 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer relative"
            :class="{'text-[#cc785c]': sectionDropdownOpen}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="mt-1 text-sm">{{ store.currentSection || 'Stadtteil' }}</span>
            <!-- Active indicator dot -->
            <div v-if="sectionDropdownOpen" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-10 bg-[#cc785c] rounded-t"></div>
          </div>
          
          <!-- Cafés -->
          <div 
            @click="toggleCafeDropdown" 
            v-if="availableCafes.length > 0"
            data-menu="cafe"
            class="flex flex-col items-center py-3 px-6 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer relative"
            :class="{'text-[#cc785c]': cafeDropdownOpen}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="mt-1 text-sm">{{ store.currentCafe ? truncateText(store.currentCafe.shop_name, 15) : 'Cafés' }}</span>
            <!-- Active indicator dot -->
            <div v-if="cafeDropdownOpen" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-10 bg-[#cc785c] rounded-t"></div>
          </div>
        </div>
      </div>
      
      <!-- Dropdown-Inhalte -->
      <div v-if="cityDropdownOpen || sectionDropdownOpen || cafeDropdownOpen" class="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg p-2 mt-1 left-1/2 transform -translate-x-1/2">
        <!-- Städte Dropdown -->
        <div v-if="cityDropdownOpen" data-content="city" class="min-w-[250px] max-h-[300px] overflow-y-auto">
          <div class="py-2 px-3 mb-1 font-medium text-gray-500 text-sm border-b">Wähle eine Stadt</div>
          <div
            v-for="city in store.availableCities"
            :key="city"
            @click="navigateToCity(city)"
            class="py-2 px-3 hover:bg-gray-100 rounded cursor-pointer flex items-center"
            :class="{'bg-gray-100': city === store.currentCity}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-black">{{ city }}</span>
            <div v-if="city === store.currentCity" class="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#cc785c]" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Stadtteile Dropdown -->
        <div v-if="sectionDropdownOpen" data-content="section" class="min-w-[250px] max-h-[300px] overflow-y-auto">
          <div class="py-2 px-3 mb-1 font-medium text-gray-500 text-sm border-b">Wähle einen Stadtteil</div>
          <div
            v-for="section in store.citySections"
            :key="section"
            @click="navigateToSection(section)"
            class="py-2 px-3 hover:bg-gray-100 rounded cursor-pointer flex items-center"
            :class="{'bg-gray-100': section === store.currentSection}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="text-black">{{ section }}</span>
            <div v-if="section === store.currentSection" class="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#cc785c]" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Cafés Dropdown -->
        <div v-if="cafeDropdownOpen" data-content="cafe" class="min-w-[250px] max-h-[300px] overflow-y-auto">
          <div class="py-2 px-3 mb-1 font-medium text-gray-500 text-sm border-b">Wähle ein Café</div>
          <div
            v-for="cafe in availableCafes"
            :key="cafe.id"
            @click="selectCafe(cafe)"
            class="py-2 px-3 hover:bg-gray-100 rounded cursor-pointer flex items-center"
            :class="{'bg-gray-100': cafe.id === store.currentCafe?.id}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-black">{{ cafe.shop_name }}</span>
            <div v-if="cafe.id === store.currentCafe?.id" class="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#cc785c]" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Bottom Navigation Component -->
    <MobileBottomNav 
      v-if="!isMenuPage && !isKontaktPage && !isImpressumPage" 
      :isMenuPage="isMenuPage"
    />
    
    <!-- Der leere Platzhalter wurde entfernt, da die Bottom Navigation bereits fixed positioniert ist -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BreadcrumbItems from './BreadcrumbItems.vue';
import MobileBottomNav from './MobileBottomNav.vue';

const store = useStore();
const route = useRoute();
const sectionDropdownOpen = ref(false);
const cityDropdownOpen = ref(false);
const cafeDropdownOpen = ref(false);
const searchInput = ref(null);

// Suchvariablen
const searchText = ref('');
const searchFocused = ref(false);
const selectedSearchIndex = ref(-1);
const searchDebounceTimeout = ref(null);

// Computed property für Suchergebnisse
const hasSearchResults = computed(() => {
  return (store.searchResults.zipCodes && store.searchResults.zipCodes.length > 0) || 
         store.searchResults.cities.length > 0 || 
         store.searchResults.sections.length > 0 || 
         store.searchResults.cafes.length > 0;
});

// Gesamtanzahl der Suchergebnisse
const totalSearchResults = computed(() => {
  return (store.searchResults.zipCodes?.length || 0) + 
         store.searchResults.cities.length + 
         store.searchResults.sections.length + 
         store.searchResults.cafes.length;
});

// Debounced Suchfunktion
function handleSearch() {
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value);
  }
  
  searchDebounceTimeout.value = setTimeout(() => {
    store.search(searchText.value);
    // Reset selected index wenn neue Suche
    selectedSearchIndex.value = -1;
  }, 300);
}

// Funktionen für Tastaturnavigation
function navigateSearchResults(direction) {
  if (!hasSearchResults.value) return;
  
  const maxIndex = totalSearchResults.value - 1;
  
  if (direction > 0) {
    // Nach unten
    selectedSearchIndex.value = 
      selectedSearchIndex.value < maxIndex ? selectedSearchIndex.value + 1 : 0;
  } else {
    // Nach oben
    selectedSearchIndex.value = 
      selectedSearchIndex.value > 0 ? selectedSearchIndex.value - 1 : maxIndex;
  }
}

// Hilfsfunktion um den Index im gesamten Suchergebnis zu bestimmen
function getResultIndexOffset(type, index) {
  if (type === 'zipCode') {
    return index;
  } else if (type === 'city') {
    return (store.searchResults.zipCodes?.length || 0) + index;
  } else if (type === 'section') {
    return (store.searchResults.zipCodes?.length || 0) + 
           store.searchResults.cities.length + index;
  } else if (type === 'cafe') {
    return (store.searchResults.zipCodes?.length || 0) + 
           store.searchResults.cities.length + 
           store.searchResults.sections.length + index;
  }
  return -1;
}

// Erste Suchergebnis auswählen (bei Enter)
function selectFirstResult() {
  if (!hasSearchResults.value) return;
  
  if (store.searchResults.zipCodes && store.searchResults.zipCodes.length > 0) {
    selectSearchResult('zipCode', store.searchResults.zipCodes[0]);
  } else if (store.searchResults.cities.length > 0) {
    selectSearchResult('city', store.searchResults.cities[0]);
  } else if (store.searchResults.sections.length > 0) {
    selectSearchResult('section', store.searchResults.sections[0]);
  } else if (store.searchResults.cafes.length > 0) {
    selectSearchResult('cafe', store.searchResults.cafes[0]);
  }
}

// Wenn auf das Suchfeld geklickt wird, zurücksetzen
async function onSearchFocus() {
  searchFocused.value = true;
  searchText.value = '';
  store.search('');
  selectedSearchIndex.value = -1;
  
  // Zurücksetzen der Produkte auf den Anfangszustand
  // Nur Stadt beibehalten, aber Stadtteil und Café zurücksetzen
  if (store.currentSection || store.currentCafe) {
    store.currentSection = null;
    store.currentCafe = null;
    await store.fetchPosts({ city: store.currentCity });
  }
}

// Ausgewähltes Suchergebnis verwenden
function selectSearchResult(type, value) {
  searchFocused.value = false; // Close dropdown
  searchText.value = ''; // Clear search
  store.navigateToSearchResult(type, value);
}

// Prüfen, ob wir uns auf bestimmten Seiten befinden
const isMenuPage = computed(() => {
  return route.path.startsWith('/menu/');
});

const isKontaktPage = computed(() => {
  return route.path === '/kontakt';
});

const isImpressumPage = computed(() => {
  return route.path === '/impressum';
});

// Computed Property für verfügbare Städte
const hasCities = computed(() => {
  return store.availableCities && store.availableCities.length > 1;
});

// Computed Property für verfügbare Cafés basierend auf aktuellen Filtern
const availableCafes = computed(() => {
  return store.posts.filter(post => post.kind === 'Product');
});

// Navigation-Funktionen delegieren zum Store
const navigateToHome = async () => {
  await store.navigateToHome();
};

const navigateToCity = async (city) => {
  if (!city) return;
  
  cityDropdownOpen.value = false;
  await store.navigateToCity(city);
};

const navigateToSection = async (section) => {
  if (!section) return;
  
  sectionDropdownOpen.value = false;
  await store.navigateToSection(section);
};

const selectCafe = (cafe) => {
  if (!cafe) return;
  
  cafeDropdownOpen.value = false;
  store.setCurrentCafe(cafe);
};

const toggleSectionDropdown = () => {
  sectionDropdownOpen.value = !sectionDropdownOpen.value;
  if (cityDropdownOpen.value) cityDropdownOpen.value = false;
  if (cafeDropdownOpen.value) cafeDropdownOpen.value = false;
};

const toggleCityDropdown = () => {
  if (hasCities.value) {
    cityDropdownOpen.value = !cityDropdownOpen.value;
    if (sectionDropdownOpen.value) sectionDropdownOpen.value = false;
    if (cafeDropdownOpen.value) cafeDropdownOpen.value = false;
  } else {
    // Wenn nur eine Stadt verfügbar ist, lade trotzdem Daten neu
    navigateToCity(store.currentCity);
  }
};

const toggleCafeDropdown = () => {
  cafeDropdownOpen.value = !cafeDropdownOpen.value;
  if (cityDropdownOpen.value) cityDropdownOpen.value = false;
  if (sectionDropdownOpen.value) sectionDropdownOpen.value = false;
};

// Helper function to truncate text for mobile display
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  // First check if we clicked on menu items or their parent containers
  const cityMenu = document.querySelector('[data-menu="city"]');
  const sectionMenu = document.querySelector('[data-menu="section"]');
  const cafeMenu = document.querySelector('[data-menu="cafe"]');
  const searchMenu = document.querySelector('[data-menu="search"]');
  
  const cityMenuContent = document.querySelector('[data-content="city"]');
  const sectionMenuContent = document.querySelector('[data-content="section"]');
  const cafeMenuContent = document.querySelector('[data-content="cafe"]');
  const searchMenuContent = document.querySelector('[data-content="search"]');
  
  // Close city dropdown if click is outside city menu and content
  if (cityDropdownOpen.value && 
      (!cityMenu || !cityMenu.contains(event.target)) && 
      (!cityMenuContent || !cityMenuContent.contains(event.target))) {
    cityDropdownOpen.value = false;
  }
  
  // Close section dropdown if click is outside section menu and content
  if (sectionDropdownOpen.value && 
      (!sectionMenu || !sectionMenu.contains(event.target)) && 
      (!sectionMenuContent || !sectionMenuContent.contains(event.target))) {
    sectionDropdownOpen.value = false;
  }
  
  // Close cafe dropdown if click is outside cafe menu and content
  if (cafeDropdownOpen.value && 
      (!cafeMenu || !cafeMenu.contains(event.target)) && 
      (!cafeMenuContent || !cafeMenuContent.contains(event.target))) {
    cafeDropdownOpen.value = false;
  }
  
  // Close search dropdown if click is outside search input and results
  if (searchFocused.value && 
      (!searchMenu || !searchMenu.contains(event.target)) && 
      (!searchMenuContent || !searchMenuContent.contains(event.target))) {
    searchFocused.value = false;
  }
};

// Shortcut CMD+K / CTRL+K für Suchfokus
const handleKeyboardShortcut = (event) => {
  // CMD+K (Mac) oder CTRL+K (Windows/Linux)
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault(); // Standardverhalten verhindern
    
    // Fokus auf Suchfeld setzen, wenn es verfügbar ist
    if (searchInput.value) {
      searchInput.value.focus();
    }
  }
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyboardShortcut);
  
  // Initialisiere Navigation mit dynamischen Daten
  await store.initNavigation();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyboardShortcut);
});
</script>