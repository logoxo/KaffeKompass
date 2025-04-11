<script setup>
// Using script setup syntax for Nuxt 3
const { $imgUrl, $setSeo, $generateSeoTags, $generateCafeSchema } = useNuxtApp();
const props = defineProps({
  obj: Object
});

// Store zur direkten Manipulation
const store = useStore();

// Komponenten-State
const activeTab = ref('info'); // 'info', 'hours', 'services'
const isImageExpanded = ref(false);
const isImageLoaded = ref(false);

// Prepare images for the slider
const shopImages = computed(() => {
  if (!props.obj.shop_img || !props.obj.shop_img.length) return [];
  
  return props.obj.shop_img.map(img => ({
    id: img.id,
    url: img.url
  }));
});

// Generate Google Maps URL using the address
const getMapUrl = () => {
  if (!props.obj.address) return '#';
  const address = `${props.obj.address.street}, ${props.obj.address.zipcode} ${props.obj.address.city}`;
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

// Get share image
const getShareImage = () => {
  if (!props.obj.shop_img || !props.obj.shop_img.length) return null;
  return $imgUrl(props.obj.shop_img[0].url);
};

// Share modal state
const isShareModalOpen = ref(false);
const availablePlatforms = ref([
  { id: 'twitter', name: 'Twitter', icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' },
  { id: 'facebook', name: 'Facebook', icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
  { id: 'instagram', name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
  { id: 'email', name: 'E-Mail', icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' }
]);

// Toggle share modal
const toggleShareModal = () => {
  isShareModalOpen.value = !isShareModalOpen.value;
};

// Close share modal when clicked outside
const closeShareModalOnOutsideClick = (event) => {
  const modal = document.getElementById('share-modal');
  if (modal && !modal.contains(event.target) && isShareModalOpen.value) {
    isShareModalOpen.value = false;
  }
};

// Set up click outside listener
onMounted(() => {
  if (process.client) {
    document.addEventListener('click', closeShareModalOnOutsideClick);
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', closeShareModalOnOutsideClick);
  }
});

// Share on specific platform
const shareToPlatform = (platform) => {
  if (!props.obj) return;
  
  const title = props.obj.shop_name || 'Café';
  const text = `Besuche ${title} in ${props.obj.address?.city || ''}!`;
  const url = window.location.href;
  const image = getShareImage();
  
  switch (platform) {
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      break;
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      break;
    case 'whatsapp':
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
      break;
    case 'email':
      window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
      break;
    default:
      // Use Web Share API if available
      if (navigator.share) {
        const shareData = {
          title: title,
          text: text,
          url: url
        };
        
        navigator.share(shareData).catch(error => {
          console.error('Error sharing:', error);
        });
      } else {
        // Fallback: Copy to clipboard
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = `${text} ${url}`;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        
        try {
          document.execCommand('copy');
          alert('Link in die Zwischenablage kopiert!');
        } catch (err) {
          console.error('Could not copy text:', err);
        }
        
        document.body.removeChild(tempTextarea);
      }
  }
  
  // Close modal after sharing
  isShareModalOpen.value = false;
}

// Set active tab - nur für mobile
const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// Toggle expanded image view - nur für mobile
const toggleImageExpanded = () => {
  isImageExpanded.value = !isImageExpanded.value;
};

// Direkte DOM-Manipulation zum Schließen des Details
const closeDetail = (event) => {
  // Event-Ausbreitung stoppen
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  console.log('Schließe Produkt-Detail');
  
  // Methode 1: Über Store-Methoden
  if (store && typeof store.remove === 'function') {
    store.remove();
  }
  
  // Methode 2: Über Plugin-API
  const { $closeDetail } = useNuxtApp();
  if ($closeDetail) {
    $closeDetail();
  }
  
  // Wir setzen einen kleinen Flag im localStorage, der uns hilft, 
  // den "doppelklick-Bug" zu umgehen
  if (process.client) {
    localStorage.setItem('lastClosedDetail', props.obj.id || 'unknown');
    localStorage.setItem('lastClosedTime', Date.now().toString());
  }
}

// Handle image loading state
const handleImageLoaded = () => {
  isImageLoaded.value = true;
};

// Set SEO data for the product detail view
const setSeoForCafe = () => {
  if (!props.obj) return;
  
  // Create SEO data object
  const seoData = {
    title: props.obj.shop_name || 'Café Details',
    description: `Besuchen Sie das ${props.obj.shop_name} in ${props.obj.address?.city_section || ''}, ${props.obj.address?.city || ''}. Öffnungszeiten, Standort, und mehr.`,
    keywords: `Café, ${props.obj.shop_name}, ${props.obj.address?.city || ''}, Öffnungszeiten`,
    image: props.obj.shop_img && props.obj.shop_img.length > 0 
      ? props.obj.shop_img[0].url 
      : null,
    canonical: `/cafe/${props.obj.slug || props.obj.id}`,
    ogType: 'business.business',
    twitterCard: 'summary_large_image'
  };
  
  // Set SEO meta tags
  if ($setSeo && $generateSeoTags) {
    $setSeo($generateSeoTags(seoData));
  }
  
  // Add JSON-LD structured data if available
  if ($generateCafeSchema) {
    const schemaString = $generateCafeSchema(props.obj);
    if (schemaString) {
      useHead({
        script: [
          {
            type: 'application/ld+json',
            children: schemaString
          }
        ]
      });
    }
  }
};

// Watch for changes in props.obj
watch(() => props.obj, (newObj) => {
  if (newObj) {
    setSeoForCafe();
    isImageLoaded.value = false; // Reset image loaded state when object changes
  }
}, { immediate: true });
</script>

<template>
  <!-- Main Container Box - Mit konsistenten UI-Elementen -->
  <div class="box-border bg-[#FAF9F6] text-black rounded-xl overflow-hidden shadow-lg relative product-detail">
    <!-- Schließen-Button (für Mobile und Desktop) -->
    <button 
      @click="closeDetail($event)"
      @mousedown.stop
      @touchstart.stop
      class="absolute right-3 top-3 z-10 bg-[#F5F4F1] bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 transition-colors"
      aria-label="Schließen"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <!-- Mobile Ansicht Container - nur für kleine Bildschirme sichtbar -->
    <div class="md:hidden">
      <!-- Mobile Header -->
      <div class="p-4 border-b border-gray-300">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold pr-6">{{ obj.shop_name }}</h1>
            <p class="text-gray-300 text-sm">{{ obj.address?.city_section }}</p>
          </div>
          <button 
            @click="toggleShareModal" 
            class="p-2 rounded-full hover:bg-white transition-colors"
            aria-label="Teilen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          
          <!-- Share Modal -->
          <div 
            v-if="isShareModalOpen" 
            id="share-modal"
            class="absolute top-12 right-0 z-20 bg-white rounded-lg shadow-lg p-3 w-64 border border-gray-200"
          >
            <h3 class="text-sm font-bold mb-2 text-gray-700">Teilen auf:</h3>
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="platform in availablePlatforms" 
                :key="platform.id"
                @click="shareToPlatform(platform.id)"
                class="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg class="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="currentColor">
                  <path :d="platform.icon" />
                </svg>
                <span class="text-xs">{{ platform.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile Image mit Toggle-Funktion -->
      <div 
        :class="[
          'relative w-full transition-all duration-300 overflow-hidden',
          isImageExpanded ? 'h-[60vh]' : 'h-52'
        ]"
      >
        <!-- Loading spinner -->
        <div v-if="!isImageLoaded" class="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cc785c]"></div>
        </div>
        
        <button 
          @click="toggleImageExpanded" 
          class="absolute bottom-2 right-2 z-10 bg-white bg-opacity-70 rounded-full p-2"
          aria-label="Bild vergrößern/verkleinern"
        >
          <svg v-if="!isImageExpanded" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <ImageSlider 
          :images="shopImages" 
          :alt="obj.shop_name" 
          :autoplay="true"
          :interval="4000"
          @image-loaded="handleImageLoaded"
        />
      </div>
      
      <!-- Mobile Tab Navigation -->
      <div class="flex border-b border-gray-700">
        <button 
          @click="setActiveTab('info')" 
          class="flex-1 py-3 px-3 text-center font-medium transition-colors"
          :class="activeTab === 'info' ? 'text-[#cc785c] border-b-2 border-[#cc785c]' : 'text-black'"
        >
          Info
        </button>
        <button 
          @click="setActiveTab('hours')" 
          class="flex-1 py-3 px-3 text-center font-medium transition-colors"
          :class="activeTab === 'hours' ? 'text-[#cc785c] border-b-2 border-[#cc785c]' : 'text-black'"
        >
          Öffnungszeiten
        </button>
        <button 
          @click="setActiveTab('services')" 
          class="flex-1 py-3 px-3 text-center font-medium transition-colors"
          :class="activeTab === 'services' ? 'text-[#cc785c] border-b-2 border-[#cc785c]' : 'text-black'"
        >
          Services
        </button>
      </div>
      
      <!-- Mobile Tab Content -->
      <div class="p-4">
        <!-- Info Tab -->
        <div v-if="activeTab === 'info'" class="animate-fade-in">
          <div class="mb-4">
            <p class="mb-1">{{ obj.address?.street }}</p>
            <p class="mb-1">{{ obj.address?.zipcode }} {{ obj.address?.city }}</p>
            <p class="mb-4">{{ obj.address?.city_section }}</p>
            <a 
              :href="getMapUrl()" 
              target="_blank" 
              rel="noopener" 
              class="inline-block px-4 py-2 bg-[#cc785c] rounded-lg text-white hover:bg-[#a66249] transition-colors"
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Auf Karte anzeigen
              </span>
            </a>
          </div>
          
          <div class="mt-6">
            <h2 class="text-xl mb-2">Rezepte</h2>
            <NuxtLink 
              :to="`/menu/${obj.slug || ''}`" 
              class="inline-block px-4 py-2 bg-[#cc785c] rounded-lg text-white hover:bg-[#a66249] transition-colors"
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Menukarte ansehen
              </span>
            </NuxtLink>
          </div>
        </div>
        
        <!-- Hours Tab -->
        <div v-if="activeTab === 'hours'" class="animate-fade-in">
          <div class="space-y-3">
            <div class="flex justify-between" v-if="obj.openings?.monday">
              <span class="font-medium md:hidden lg:inline">Montag</span><span class="font-medium hidden md:inline lg:hidden">Mo</span>
              <span>{{ obj.openings.monday }}</span>
            </div>
            <div class="flex justify-between" v-if="obj.openings?.tuesday">
              <span class="font-medium md:hidden lg:inline">Dienstag</span><span class="font-medium hidden md:inline lg:hidden">Di</span>
              <span>{{ obj.openings.tuesday }}</span>
            </div>
            <div class="flex justify-between" v-if="obj.openings?.wednesday">
              <span class="font-medium md:hidden lg:inline">Mittwoch</span><span class="font-medium hidden md:inline lg:hidden">Mi</span>
              <span>{{ obj.openings.wednesday }}</span>
            </div>
            <div class="flex justify-between" v-if="obj.openings?.thursday">
              <span class="font-medium md:hidden lg:inline">Donnerstag</span><span class="font-medium hidden md:inline lg:hidden">Do</span>
              <span>{{ obj.openings.thursday }}</span>
            </div>
            <div class="flex justify-between" v-if="obj.openings?.friday">
              <span class="font-medium md:hidden lg:inline">Freitag</span><span class="font-medium hidden md:inline lg:hidden">Fr</span>
              <span>{{ obj.openings.friday }}</span>
            </div>
            <div class="flex justify-between" v-if="obj.openings?.saturday">
              <span class="font-medium md:hidden lg:inline">Samstag</span><span class="font-medium hidden md:inline lg:hidden">Sa</span>
              <span>{{ obj.openings.saturday }}</span>
            </div>
            <div class="flex justify-between" v-if="obj.openings?.sunday">
              <span class="font-medium md:hidden lg:inline">Sonntag</span><span class="font-medium hidden md:inline lg:hidden">So</span>
              <span>{{ obj.openings.sunday }}</span>
            </div>
          </div>
        </div>
        
        <!-- Services Tab -->
        <div v-if="activeTab === 'services'" class="animate-fade-in">
          <!-- Services Section -->
          <div class="mb-6">
            <h2 class="text-xl mb-4">Services</h2>
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-[#cc785c] p-3 rounded-lg flex items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <span>Gratis Wi-Fi</span>
              </div>
              <div class="bg-[#cc785c] p-3 rounded-lg flex items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>Hunde erlaubt</span>
              </div>
            </div>
          </div>
          
          <!-- Payment Section -->
          <div>
            <h2 class="text-xl mb-4">Bezahloptionen</h2>
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-[#cc785c] p-3 rounded-lg flex items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Bargeld</span>
              </div>
              <div class="bg-[#cc785c] p-3 rounded-lg flex items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Kreditkarten</span>
              </div>
              <div class="bg-[#cc785c] p-3 rounded-lg flex items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Paypal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- DESKTOP LAYOUT - Mit verbesserten Icons und Buttons -->
    <div class="hidden md:flex md:flex-row box-border">
      <!-- Image Slider Box mit Toggle-Button -->
      <div class="box-border md:w-1/3 p-4 relative">
        <!-- Loading spinner -->
        <div v-if="!isImageLoaded" class="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cc785c]"></div>
        </div>
        
        <div class="box-content h-64 md:h-full">
          <ImageSlider 
            :images="shopImages" 
            :alt="obj.shop_name" 
            :autoplay="true"
            :interval="4000"
            @image-loaded="handleImageLoaded"
          />
          
          <!-- Toggle-Button für Bildgröße (optional für Desktop) -->
          <button 
            @click="toggleImageExpanded" 
            class="absolute bottom-6 right-6 z-10 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-90 transition-colors"
            aria-label="Bild vergrößern/verkleinern"
          >
            <svg v-if="!isImageExpanded" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Content Wrapper Box -->
      <div class="box-border md:w-2/3 p-6">
        <!-- Inner Content Grid -->
        <div class="box-border grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Info Box -->
          <div class="box-border">
            <!-- Cafe Name & Address with Share Icon -->
            <div class="box-border mb-6">
              <div class="box-border flex justify-between items-center mb-2">
                <h1 class="box-border text-2xl font-bold">{{ obj.shop_name }}</h1>
                <button 
                  @click="toggleShareModal" 
                  class="box-border p-2 rounded-full hover:bg-white transition-colors"
                  aria-label="Teilen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                
                <!-- Desktop Share Modal -->
                <div 
                  v-if="isShareModalOpen" 
                  id="share-modal"
                  class="absolute top-12 right-0 z-20 bg-white rounded-lg shadow-lg p-3 w-64 border border-gray-200"
                >
                  <h3 class="text-sm font-bold mb-2 text-gray-700">Teilen auf:</h3>
                  <div class="grid grid-cols-3 gap-2">
                    <button 
                      v-for="platform in availablePlatforms" 
                      :key="platform.id"
                      @click="shareToPlatform(platform.id)"
                      class="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      <svg class="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="currentColor">
                        <path :d="platform.icon" />
                      </svg>
                      <span class="text-xs">{{ platform.name }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <p class="box-border mb-1">{{ obj.address?.street }}</p>
              <p class="box-border mb-1">{{ obj.address?.zipcode }} {{ obj.address?.city }}</p>
              <p class="box-border mb-4">{{ obj.address?.city_section }}</p>
              
              <!-- Karten-Button im modernen Stil -->
              <a 
                :href="getMapUrl()" 
                target="_blank" 
                rel="noopener" 
                class="inline-block px-4 py-2 bg-[#cc785c] rounded-lg text-white hover:bg-[#a66249] transition-colors"
              >
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Hier finden Sie uns (Karte)
                </span>
              </a>
            </div>
            
            <!-- Menu Link Box -->
            <div class="box-border mt-6">
              <h2 class="box-border text-xl mb-2">Rezepte</h2>
              
              <!-- Menükarten-Button im modernen Stil -->
              <NuxtLink 
                :to="`/menu/${obj.slug || ''}`" 
                class="inline-block px-4 py-2 bg-[#cc785c] rounded-lg text-white hover:bg-[#a66249] transition-colors"
              >
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Menukarte
                </span>
              </NuxtLink>
            </div>
          </div>
          
          <!-- Hours Box -->
          <div class="box-border">
            <h2 class="box-border text-xl mb-4">Öffnungszeiten</h2>
            
            <!-- Days Grid mit verbesserten Styles -->
            <div class="box-border space-y-3">
              <div class="box-border flex justify-between items-center py-2 px-1 border-b border-gray-300" v-if="obj.openings?.monday">
                <span class="font-medium md:hidden lg:inline">Montag</span><span class="font-medium hidden md:inline lg:hidden">Mo</span>
                <span>{{ obj.openings.monday }}</span>
              </div>
              <div class="box-border flex justify-between items-center py-2 px-1 border-b border-gray-300" v-if="obj.openings?.tuesday">
                <span class="font-medium md:hidden lg:inline">Dienstag</span><span class="font-medium hidden md:inline lg:hidden">Di</span>
                <span>{{ obj.openings.tuesday }}</span>
              </div>
              <div class="box-border flex justify-between items-center py-2 px-1 border-b border-gray-300" v-if="obj.openings?.wednesday">
                <span class="font-medium md:hidden lg:inline">Mittwoch</span><span class="font-medium hidden md:inline lg:hidden">Mi</span>
                <span>{{ obj.openings.wednesday }}</span>
              </div>
              <div class="box-border flex justify-between items-center py-2 px-1 border-b border-gray-300" v-if="obj.openings?.thursday">
                <span class="font-medium md:hidden lg:inline">Donnerstag</span><span class="font-medium hidden md:inline lg:hidden">Do</span>
                <span>{{ obj.openings.thursday }}</span>
              </div>
              <div class="box-border flex justify-between items-center py-2 px-1 border-b border-gray-300" v-if="obj.openings?.friday">
                <span class="font-medium md:hidden lg:inline">Freitag</span><span class="font-medium hidden md:inline lg:hidden">Fr</span>
                <span>{{ obj.openings.friday }}</span>
              </div>
              <div class="box-border flex justify-between items-center py-2 px-1 border-b border-gray-300" v-if="obj.openings?.saturday">
                <span class="font-medium md:hidden lg:inline">Samstag</span><span class="font-medium hidden md:inline lg:hidden">Sa</span>
                <span>{{ obj.openings.saturday }}</span>
              </div>
              <div class="box-border flex justify-between items-center py-2 px-1 border-b border-gray-300" v-if="obj.openings?.sunday">
                <span class="font-medium md:hidden lg:inline">Sonntag</span><span class="font-medium hidden md:inline lg:hidden">So</span>
                <span>{{ obj.openings.sunday }}</span>
              </div>
            </div>
          </div>
          
          <!-- Services Box -->
          <div class="box-border">
            <!-- Services Section mit Icons -->
            <div class="box-border mb-6">
              <h2 class="box-border text-xl mb-4">Services</h2>
              <div class="box-border space-y-2">
                <div class="flex items-center py-2 px-1 border-b border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#cc785c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                  <span>Gratis Wi-Fi</span>
                </div>
                <div class="flex items-center py-2 px-1 border-b border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#cc785c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>Hunde erlaubt</span>
                </div>
              </div>
            </div>
            
            <!-- Payment Section mit Icons -->
            <div class="box-border">
              <h2 class="box-border text-xl mb-4">Bezahloptionen</h2>
              <div class="box-border space-y-2">
                <div class="flex items-center py-2 px-1 border-b border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#cc785c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Bargeld</span>
                </div>
                <div class="flex items-center py-2 px-1 border-b border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#cc785c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Kreditkarten</span>
                </div>
                <div class="flex items-center py-2 px-1 border-b border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#cc785c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Paypal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Remove focus outline for all elements */
*:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>