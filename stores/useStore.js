import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useStore = defineStore('main', () => {
  // State
  const closedList = ref([]);
  const posts = ref([]);
  const loading = ref(false);
  const currentCity = ref('Köln');
  const currentSection = ref(null);
  const currentCafe = ref(null);
  const error = ref(null);
  const searchQuery = ref('');
  const searchResults = ref({
    cities: [],
    sections: [],
    cafes: []
  });

  // Navigation state - dynamisch
  const citySections = ref([]);
  const availableCities = ref([]);

  // Getters
  const getPosts = computed(() => posts.value);
  
  // Methode zum Laden aller verfügbaren Städte
  async function loadAvailableCities() {
    try {
      const { find } = useStrapi();
      
      // Wir fragen nur die benötigten Felder ab und gruppieren nach Stadt
      const { data } = await find('posts', {
        fields: ['id'],
        populate: {
          address: {
            fields: ['city']
          }
        }
      });
      
      // Extraktion der eindeutigen Städte
      const cities = data
        .map(post => post.address?.city)
        .filter(city => city) // Nur gültige Werte
        .filter((city, index, self) => self.indexOf(city) === index); // Duplikate entfernen
      
      availableCities.value = cities;
      
      // Wenn noch keine Stadt gesetzt ist und Städte verfügbar sind
      if (!currentCity.value && cities.length > 0) {
        currentCity.value = cities[0];
      }
      
      return cities;
    } catch (err) {
      console.error('Error fetching cities:', err);
      return [];
    }
  }
  
  // Methode zum Laden aller verfügbaren Stadtteile für eine bestimmte Stadt
  async function loadCitySections(city = currentCity.value) {
    try {
      const { find } = useStrapi();
      
      // Wir fragen nur die benötigten Felder ab und filtern nach Stadt
      const { data } = await find('posts', {
        fields: ['id'],
        filters: {
          address: {
            city: {
              $eq: city
            }
          }
        },
        populate: {
          address: {
            fields: ['city_section']
          }
        }
      });
      
      // Extraktion der eindeutigen Stadtteile
      const sections = data
        .map(post => post.address?.city_section)
        .filter(section => section) // Nur gültige Werte
        .filter((section, index, self) => self.indexOf(section) === index); // Duplikate entfernen
      
      citySections.value = sections;
      
      return sections;
    } catch (err) {
      console.error('Error fetching city sections:', err);
      return [];
    }
  }

  // Methode zum Initialisieren der Navigationsstate
  async function initNavigation() {
    await loadAvailableCities();
    await loadCitySections();
  }

  async function fetchPosts(params = {}) {
    loading.value = true;
    error.value = null;
    
    try {
      const { find } = useStrapi();
      
      // Korrekte Filter-Struktur für verschachtelte Felder
      let queryParams = {
        populate: '*',
      };
      
      // If a cafeId is specified, only filter by that ID and ignore city/section filters
      if (params.cafeId) {
        queryParams.filters = {
          id: {
            $eq: params.cafeId
          }
        };
      } else {
        // Only apply city/section filters if no specific café is selected
        // Wenn ein Stadtteil ausgewählt wurde, füge ihn als Filter hinzu
        if (params.section) {
          queryParams.filters = {
            ...(queryParams.filters || {}),
            address: {
              city_section: {
                $eq: params.section
              }
            }
          };
        }
        
        // Wenn eine Stadt ausgewählt wurde, füge sie als Filter hinzu
        if (params.city) {
          queryParams.filters = {
            ...(queryParams.filters || {}),
            address: {
              ...(queryParams.filters?.address || {}),
              city: {
                $eq: params.city
              }
            }
          };
        }
      }
      
      console.log("Strapi query params:", queryParams);
      
      const { data, error: fetchError } = await find('posts', queryParams);
      
      if (fetchError) throw new Error(fetchError.message);
      
      // Add a unique incremental ID to each post
      posts.value = data.map((post, index) => {
        return {
          ...post,
          uniqueId: index + 1,
          kind: 'Product'
        }
      });
      
      return posts.value;
    } catch (err) {
      console.error('Error fetching posts:', err);
      error.value = err.message || 'Failed to fetch posts';
    } finally {
      loading.value = false;
    }
  }

  // Aktualisierte Funktion zum Setzen des aktuellen Cafés
  function setCurrentCafe(cafe) {
    // Setze das aktuelle Café
    currentCafe.value = cafe;
    
    if (cafe && cafe.id) {
      // Fetch only this specific café by ID
      fetchPosts({ cafeId: cafe.id });
      
      // If the café has address information, update city and section for consistency
      if (cafe.address) {
        if (cafe.address.city) {
          currentCity.value = cafe.address.city;
        }
        if (cafe.address.city_section) {
          currentSection.value = cafe.address.city_section;
        }
      }
    }
  }

  // Funktion: Navigiere zu einer Stadt
  async function navigateToCity(city) {
    currentCity.value = city;
    currentSection.value = null; // Zurücksetzen des Stadtteils
    currentCafe.value = null; // Zurücksetzen des aktuellen Cafés
    
    // Lade neue Stadtteile für diese Stadt
    await loadCitySections(city);
    
    clearProducts(); // Bestehende Daten löschen
    return await fetchPosts({ city }); // Daten für die Stadt laden
  }

  // Funktion: Navigiere zu einem Stadtteil
  async function navigateToSection(section) {
    currentSection.value = section;
    currentCafe.value = null; // Zurücksetzen des aktuellen Cafés
    clearProducts(); // Bestehende Daten löschen
    return await fetchPosts({ 
      city: currentCity.value, 
      section
    }); // Daten für den Stadtteil laden
  }

  // Funktion: Navigiere zur Startseite
  async function navigateToHome() {
    // Stadt beibehalten, aber Stadtteil zurücksetzen
    currentSection.value = null; 
    currentCafe.value = null; // Zurücksetzen des aktuellen Cafés
    
    clearProducts(); // Bestehende Daten löschen
    return await fetchPosts({ city: currentCity.value }); // Daten für aktuelle Stadt laden
  }

  // Funktion: Navigiere zu einem spezifischen Café
  async function navigateToCafe(cafeId) {
    clearProducts(); // Bestehende Daten löschen
    
    // Explicitly fetch only the selected café, passing just the cafeId parameter
    const cafeData = await fetchPosts({ cafeId });
    
    if (cafeData && cafeData.length > 0) {
      currentCafe.value = cafeData[0];
      
      // Also update current city and section to match the café's location
      if (cafeData[0].address) {
        currentCity.value = cafeData[0].address.city || currentCity.value;
        currentSection.value = cafeData[0].address.city_section || currentSection.value;
      }
    }
    
    return cafeData;
  }

  // Funktion: Lade Café-Details
  async function loadCafeDetail(cafeId) {
    try {
      const { findOne } = useStrapi();
      
      const response = await findOne('posts', cafeId, {
        populate: '*'
      });
      
      if (response.data) {
        currentCafe.value = response.data;
        return response.data;
      }
    } catch (err) {
      console.error('Error loading cafe detail:', err);
    }
    
    return null;
  }

  function closedBundels(payload) {
    closedList.value = [...payload];
  }

  function addProducts(payload) {
    if (payload.hasOwnProperty('update')) {
      posts.value = [...payload.update];
    }
    if (payload.hasOwnProperty('insert')) {
      posts.value.push(payload.insert);
    }
  }

  function addProductDetail(payload) {
    posts.value.splice(payload.index, 0, payload.obj);
  }

  function removeProductDetail(payload) {
    posts.value.splice(payload, 1);
  }

  function clearProducts() {
    posts.value = [];
  }

  function remove() {
    const ProductDetailIndex = posts.value.findIndex(x => x.kind === 'ProductDetail');
    if (ProductDetailIndex > 0) removeProductDetail(ProductDetailIndex);
  }

  function update(payload) {
    console.log("store update")
    if (posts.value.length <= payload.index) {
      addProducts({ insert: payload.obj });
    } else {
      addProductDetail({ index: payload.index, obj: payload.obj });
    }
  }

  async function closeFunding(payload) {
    try {
      const events = await payload.getPastEvents('CloseFunding', { fromBlock: 0, toBlock: 'latest' });
      const closed = events.map(event => event.returnValues.id);
      closedBundels(closed);
    } catch (error) {
      console.error(error);
    }
  }

  function send(payload) {
    addAddr(payload);
  }

  async function login() {
    try {
      const resp = await call.req({ meth: 'post', url: 'login', data: { address: address.value } });
      console.log(resp);
    } catch (error) {
      console.error(error);
    }
  }

  function logout() {
    removeAddr();
  }

  async function updateDB(payload) {
    try {
      const resp = await call.req({ meth: 'post', url: '', data: payload });
      console.log(resp);
    } catch (error) {
      console.error(error);
    }
  }

  async function txDB(payload) {
    try {
      const resp = await call.req({ meth: 'post', url: 'tx', data: payload });
      console.log(resp);
    } catch (error) {
      console.error(error);
    }
  }
  
  // Suchfunktion
  function search(query) {
    if (!query || query.trim() === '') {
      searchQuery.value = '';
      searchResults.value = {
        cities: [],
        sections: [],
        cafes: [],
        zipCodes: []
      };
      return;
    }
    
    searchQuery.value = query.trim();
    const lowercaseQuery = searchQuery.value.toLowerCase();
    
    // Suche in Städten
    searchResults.value.cities = availableCities.value.filter(city => 
      city.toLowerCase().includes(lowercaseQuery)
    );
    
    // Suche in Stadtteilen
    searchResults.value.sections = citySections.value.filter(section => 
      section.toLowerCase().includes(lowercaseQuery)
    );
    
    // Suche in Cafés
    searchResults.value.cafes = posts.value
      .filter(post => post.kind === 'Product' && post.shop_name?.toLowerCase().includes(lowercaseQuery))
      .map(cafe => ({
        id: cafe.id,
        name: cafe.shop_name,
        address: cafe.address
      }));
      
    // Suche nach Postleitzahlen
    // Extrahiere alle verfügbaren Postleitzahlen aus den Posts
    const zipCodes = posts.value
      .filter(post => post.kind === 'Product' && (post.address?.zip_code || post.address?.zipcode))
      .map(post => ({
        zipCode: post.address.zip_code || post.address.zipcode,
        city: post.address.city,
        section: post.address.city_section
      }))
      // Entferne Duplikate
      .filter((value, index, self) => 
        index === self.findIndex(t => t.zipCode === value.zipCode)
      );
      
    // Filtere nach der Suchanfrage
    searchResults.value.zipCodes = zipCodes.filter(item => 
      item.zipCode && item.zipCode.toString().includes(query)
    );
  }
  
  // Helfer-Methode zur Navigation zu einem Suchergebnis
  function navigateToSearchResult(resultType, resultValue) {
    switch (resultType) {
      case 'city':
        return navigateToCity(resultValue);
      case 'section':
        return navigateToSection(resultValue);
      case 'cafe':
        return setCurrentCafe(resultValue);
      case 'zipCode':
        // Navigiere zur Stadt und Stadtteil basierend auf PLZ
        if (resultValue.city) {
          currentCity.value = resultValue.city;
          if (resultValue.section) {
            currentSection.value = resultValue.section;
            return fetchPosts({ city: resultValue.city, section: resultValue.section });
          } else {
            currentSection.value = null;
            return fetchPosts({ city: resultValue.city });
          }
        }
        return;
      default:
        console.error('Unknown result type:', resultType);
    }
  }

  return {
    // State
    closedList,
    posts,
    loading,
    error,
    currentCity,
    currentSection,
    currentCafe,
    citySections,
    availableCities,
    searchQuery,
    searchResults,

    // Getters
    getPosts,

    // Actions
    initNavigation,
    loadAvailableCities,
    loadCitySections,
    fetchPosts,
    navigateToCity,
    navigateToSection,
    navigateToHome,
    navigateToCafe,
    setCurrentCafe,
    loadCafeDetail,
    closedBundels,
    addProducts,
    addProductDetail,
    removeProductDetail,
    clearProducts,
    remove,
    update,
    closeFunding,
    send,
    login,
    logout,
    updateDB,
    txDB,
    search,
    navigateToSearchResult,
  };
});