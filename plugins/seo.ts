// plugins/seo.ts
export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.siteUrl || ''
    
    return {
      provide: {
        setSeo: (metaTags) => {
          useHead({
            meta: metaTags.filter(tag => tag.name || tag.property),
            title: metaTags.find(tag => tag.title)?.title || '',
            link: metaTags.filter(tag => tag.rel)
          })
        },
        
        generateSeoTags: (seoData) => {
          if (!seoData) return []
  
          const { title, description, keywords, image, canonical, ogType, twitterCard } = seoData
          const metaTags = []
  
          // Add title separately as it's handled differently in useHead
          if (title) {
            metaTags.push({ title })
          }
  
          // Basic meta tags
          if (description) {
            metaTags.push({ name: 'description', content: description })
          }
  
          if (keywords) {
            metaTags.push({ name: 'keywords', content: keywords })
          }
  
          // Canonical URL
          if (canonical) {
            metaTags.push({ rel: 'canonical', href: `${baseUrl}${canonical}` })
          }
  
          // Open Graph tags
          if (title) {
            metaTags.push({ property: 'og:title', content: title })
          }
  
          if (description) {
            metaTags.push({ property: 'og:description', content: description })
          }
  
          metaTags.push({ property: 'og:type', content: ogType || 'website' })
          
          // Use route for server-side compatibility instead of window.location
          const route = useRoute()
          if (baseUrl) {
            metaTags.push({ property: 'og:url', content: `${baseUrl}${route.fullPath}` })
          }
  
          if (image) {
            const imgUrl = image.startsWith('http') ? image : `${baseUrl}${image}`
            metaTags.push({ property: 'og:image', content: imgUrl })
          }
  
          // Twitter Card tags
          metaTags.push({ name: 'twitter:card', content: twitterCard || 'summary_large_image' })
  
          if (title) {
            metaTags.push({ name: 'twitter:title', content: title })
          }
  
          if (description) {
            metaTags.push({ name: 'twitter:description', content: description })
          }
  
          if (image) {
            const imgUrl = image.startsWith('http') ? image : `${baseUrl}${image}`
            metaTags.push({ name: 'twitter:image', content: imgUrl })
          }
  
          return metaTags
        }
      }
    }
  })