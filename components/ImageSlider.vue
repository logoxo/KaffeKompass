<template>
    <div class="relative overflow-hidden rounded-lg h-full">
      <!-- Images -->
      <div class="h-full w-full relative">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="absolute inset-0 transition-opacity duration-500 w-full h-full"
          :class="{ 'opacity-0': currentIndex !== index, 'opacity-100': currentIndex === index }"
        >
          <img 
            :src="$imgUrl(image.url)" 
            :alt="alt || 'Image ' + (index + 1)" 
            class="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
  
      <!-- Navigation Arrows - only show if there are multiple images -->
      <template v-if="images.length > 1">
        <!-- Previous Arrow -->
        <button 
          @click="prev" 
          class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full p-2 focus:outline-none"
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <!-- Next Arrow -->
        <button 
          @click="next" 
          class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full p-2 focus:outline-none"
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <!-- Dots Indicator -->
        <div class="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
          <button 
            v-for="(_, index) in images" 
            :key="index"
            @click="goToSlide(index)"
            class="w-2 h-2 rounded-full focus:outline-none transition-colors duration-200"
            :class="currentIndex === index ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'"
            :aria-label="`Go to image ${index + 1}`"
          ></button>
        </div>
      </template>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  
  const { $imgUrl } = useNuxtApp();
  
  const props = defineProps({
    images: {
      type: Array,
      required: true,
      default: () => []
    },
    alt: {
      type: String,
      default: ''
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    interval: {
      type: Number,
      default: 5000
    }
  });
  
  const currentIndex = ref(0);
  let intervalId = null;
  
  // Navigation functions
  const next = () => {
    currentIndex.value = (currentIndex.value + 1) % props.images.length;
  };
  
  const prev = () => {
    currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
  };
  
  const goToSlide = (index) => {
    currentIndex.value = index;
  };
  
  // Setup autoplay if enabled
  const setupAutoplay = () => {
    if (props.autoplay && props.images.length > 1) {
      intervalId = setInterval(() => {
        next();
      }, props.interval);
    }
  };
  
  const clearAutoplay = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  // Watch for changes in the images prop
  watch(() => props.images, (newImages) => {
    // Reset to first image when images change
    currentIndex.value = 0;
    
    // Reset autoplay
    clearAutoplay();
    setupAutoplay();
  }, { deep: true });
  
  onMounted(() => {
    setupAutoplay();
  });
  
  // Clean up interval when component is unmounted
  onUnmounted(() => {
    clearAutoplay();
  });
  </script>