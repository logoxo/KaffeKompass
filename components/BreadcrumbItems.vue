<template>
    <div class="flex items-center">
      <!-- Stadt-Auswahl -->
      <div 
        class="text-2xl font-bold cursor-pointer hover:text-gray-300 transition-colors relative"
        @click="$emit('toggle-city')"
      >
        {{ currentCity }}
        <div v-if="hasCities" class="inline-block ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
        
        <!-- Stadt-Dropdown -->
        <div v-if="cityDropdownOpen && hasCities" class="absolute z-20 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-1 left-0">
          <a 
            v-for="city in availableCities" 
            :key="city" 
            @click.stop="$emit('select-city', city)"
            class="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            :class="{ 'font-bold': city === currentCity }"
          >
            {{ city }}
          </a>
        </div>
      </div>
      
      <div class="mx-6 text-gray-400">|</div>
      
      <!-- Dropdown für Stadtteile -->
      <div class="relative">
        <button 
          @click="$emit('toggle-section')" 
          class="text-2xl font-bold flex items-center hover:text-gray-300 transition-colors"
        >
          {{ currentSection || "Stadtteil wählen" }}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <div v-if="sectionDropdownOpen" class="absolute z-10 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-1">
          <template v-if="citySections && citySections.length > 0">
            <a 
              v-for="section in citySections" 
              :key="section" 
              @click.stop="$emit('select-section', section)"
              class="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              :class="{ 'font-bold': section === currentSection }"
            >
              {{ section }}
            </a>
          </template>
          <div v-else class="block px-4 py-2 text-sm text-gray-500">
            Keine Stadtteile verfügbar
          </div>
        </div>
      </div>
      
      <div class="mx-6 text-gray-400">|</div>
      
      <!-- Dynamisches Café-Label oder Dropdown -->
      <div class="relative">
        <button 
          @click="$emit('toggle-cafe')" 
          class="text-2xl font-bold flex items-center hover:text-gray-300 transition-colors"
        >
          {{ currentCafe?.shop_name || "Cafe auswählen" }}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <div v-if="cafeDropdownOpen" class="absolute z-10 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-1 right-0">
          <template v-if="availableCafes && availableCafes.length > 0">
            <a 
              v-for="cafe in availableCafes" 
              :key="cafe.id" 
              @click.stop="$emit('select-cafe', cafe)"
              class="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              :class="{ 'font-bold': cafe.id === currentCafe?.id }"
            >
              {{ cafe.shop_name }}
            </a>
          </template>
          <div v-else class="block px-4 py-2 text-sm text-gray-500">
            Keine Cafés verfügbar
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    currentCity: {
      type: String,
      required: true
    },
    currentSection: {
      type: String,
      default: null
    },
    currentCafe: {
      type: Object,
      default: null
    },
    availableCities: {
      type: Array,
      default: () => []
    },
    citySections: {
      type: Array,
      default: () => []
    },
    availableCafes: {
      type: Array,
      default: () => []
    },
    hasCities: {
      type: Boolean,
      default: false
    },
    cityDropdownOpen: {
      type: Boolean,
      default: false
    },
    sectionDropdownOpen: {
      type: Boolean,
      default: false
    },
    cafeDropdownOpen: {
      type: Boolean,
      default: false
    }
  });
  
  defineEmits([
    'toggle-city', 
    'toggle-section', 
    'toggle-cafe', 
    'select-city', 
    'select-section', 
    'select-cafe'
  ]);
  </script>
  
  <style scoped>
  /* Transitions for dropdowns */
  .absolute {
    transition: all 0.2s ease-in-out;
  }
  </style>