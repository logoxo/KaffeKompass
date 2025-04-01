// utils/seo.ts
import { useState } from '#app'

export const useSeo = () => {
  const { find } = useStrapi()
  const loading = useState('seo-loading', () => false)
  const error = useState('seo-error', () => null)

  /**
   * Fetches SEO data from the Strapi API
   * @param slug - The slug of the page
   * @param type - The content type in Strapi (default: 'posts')
   */
  const fetchSeoData = async (slug: string, type: string = 'posts') => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await find(type, {
        filters: {
          slug: {
            $eq: slug
          }
        },
        populate: {
          seo: {
            populate: '*'
          },
          shop_img: {
            populate: '*'
          }
        }
      })

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch SEO data')
      }

      if (!data || data.length === 0) {
        return null
      }

      // Extract and return SEO data
      const content = data[0]
      
      // Return structured SEO data or default values
      return {
        title: content.seo?.metaTitle || content.shop_name || '',
        description: content.seo?.metaDescription || '',
        keywords: content.seo?.keywords || '',
        image: content.shop_img && content.shop_img.length > 0 
          ? content.shop_img[0].url 
          : null,
        canonical: content.seo?.canonicalURL || '',
        ogType: content.seo?.ogType || 'website',
        twitterCard: content.seo?.twitterCard || 'summary_large_image',
        rawData: content
      }
    } catch (err) {
      console.error('Error fetching SEO data:', err)
      error.value = err.message || 'An unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Creates meta tags for the head section
   * @param seoData - The SEO data from fetchSeoData
   * @param baseUrl - The base URL of the site
   */
  const generateMetaTags = (seoData, baseUrl = '') => {
    if (!seoData) return []

    const { title, description, keywords, image, canonical, ogType, twitterCard } = seoData
    const metaTags = []

    // Basic meta tags
    if (title) {
      metaTags.push({ title })
    }

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

    metaTags.push({ property: 'og:type', content: ogType })

    if (image) {
      const imgUrl = image.startsWith('http') ? image : `${baseUrl}${image}`
      metaTags.push({ property: 'og:image', content: imgUrl })
    }

    // Twitter Card tags
    metaTags.push({ name: 'twitter:card', content: twitterCard })

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

  return {
    fetchSeoData,
    generateMetaTags,
    loading,
    error
  }
}