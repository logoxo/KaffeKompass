export default defineNuxtPlugin((nuxtApp) => {
    return {
      provide: {
        imgUrl: (img) => {
          const strapiUrl = useRuntimeConfig().public.strapi.url;
          
          // Handle undefined or null image paths
          if (!img) return '';
          
          // Make sure the URL doesn't have double slashes between domain and path
          // If img starts with "/" and strapiUrl ends with "/", we need to avoid "//"
          if (img.startsWith('/') && strapiUrl.endsWith('/')) {
            return `${strapiUrl.slice(0, -1)}${img}`;
          }
          
          // If neither has a slash, we need to add one
          if (!img.startsWith('/') && !strapiUrl.endsWith('/')) {
            return `${strapiUrl}/${img}`;
          }
          
          // Otherwise, the URL and path can be joined directly
          return `${strapiUrl}${img}`;
        }
      }
    }
  })