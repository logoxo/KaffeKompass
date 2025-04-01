<template>
  <div
    class="overflow-hidden rounded-md shadow-lg bg-white block w-full h-80 md:h-72 lg:h-64 xl:h-80 bg-cover cursor-pointer relative"
    :style="{ backgroundImage: 'url(' + $imgUrl(obj.shop_img && obj.shop_img.length > 0 ? obj.shop_img[0].url : '') + ')' }"
    @click="handleClick"
  >
    <!-- Details-Overlay am unteren Rand -->
    <div class="absolute bottom-0 left-0 right-0 p-2 bg-[#FAF9F6]">
      <div>
        <h3 class="text-xl font-normal text-black">{{ obj.shop_name }}</h3>
        <span href="#" class="text-black text-sm" >Öffnungszeiten</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

const { $productSetup } = useNuxtApp();
const { $imgUrl } = useNuxtApp();

const props = defineProps({
  obj: {
    type: Object,
    required: true
  }
});

// Vereinfachter Click-Handler
const handleClick = () => {
  console.log("Product clicked:", props.obj.id, props.obj.shop_name);
  
  if (!props.obj || !props.obj.id) {
    console.error("Invalid product object");
    return;
  }
  
  if ($productSetup) {
    $productSetup(props.obj);
  } else {
    console.error("$productSetup function not available");
  }
};
</script>

<style scoped>
.image-gray {
  filter: grayscale(1);
}
.inactive-image {
  filter: none;
}
</style>