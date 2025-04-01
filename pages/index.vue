<template>
  <div v-if="!loading" class="home px-4 pt-8">
    <div class="mx-auto pb-4">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(post, index) in posts"
            :key="index"
            :class="post.kind === 'Product' ? 'item-' + post.uniqueId : 'col-span-full product-detail'"
          >
            <component :is="getComponent(post.kind)" :obj="{ ...post, index: post.uniqueId, total: posts.length }" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="home pt-8">
    <div class="h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="flex items-center justify-center">
          <img id="ant-bundle-logo" src="../assets/svg/logo.svg" class="w-14 ml-2" alt="" />
        </div>
        <p class="text-4xl font-bold text-gray-700 pt-4 text-center">
          Your payment is being processed. <br />
          <span class="text-white">Please do not close this ...</span><br />
          Check Metamask for more information.<br />
        </p>
        <div id="spinner" class="flex items-center justify-center">
          <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { useStore } from '@/store'; // Adjust the import path based on your store location
import Product from '~/components/Product.vue';
import ProductDetail from '~/components/ProductDetail.vue';

// Define props
const props = defineProps({
  name: {
    type: String,
    default: 'Mike'
  }
});

const store = useStore();

// SEO setup
const { $setSeo, $generateSeoTags } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const baseUrl = runtimeConfig.public.siteUrl || '';

// Set SEO tags
onMounted(() => {
  const seoTags = $generateSeoTags({
    title: 'Café Finder | Die besten Cafés in Deutschland',
    description: 'Entdecken Sie die besten Cafés in Ihrer Nähe. Menükarten, Öffnungszeiten und mehr auf einen Blick.',
    keywords: 'cafés, coffee shop, menükarte, speisekarte, café finder',
    image: '/assets/img/background.png',
    canonical: '/',
    ogType: 'website',
    twitterCard: 'summary_large_image'
  });
  
  $setSeo(seoTags);
});

const loading = ref(false);
const perRow = ref(4);
const showProductDetail = ref(true);
const openIndex = ref(null);
const prevImage = ref(null);
const prevRow = ref(null);

const posts = computed(() => store.posts);



const setPerRowValue = () => {
  closeProductDetail();
  if (window.innerWidth < 768) {
    perRow.value = 1;
  } else if (window.innerWidth > 767 && window.innerWidth < 976) {
    perRow.value = 2;
  } else if (window.innerWidth > 975) {
    perRow.value = 4;
  }
};

const closeProductDetail = () => {
  console.log("close index")
  store.remove();
  showProductDetail.value = !showProductDetail.value;
  prevImage.value = null;
  prevRow.value = null;
};



// Use a simple map to resolve components
const getComponent = (kind) => {
  const componentMap = {
    Product: Product,
    ProductDetail: ProductDetail,
  };
  return componentMap[kind] || null;
};

onMounted(() => {
  setPerRowValue();
  window.addEventListener('resize', setPerRowValue);
  //store.loadDB();
});

onMounted(async () => {
  await store.fetchPosts();
  // You can do something after posts are loaded
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', setPerRowValue);
});
</script>
