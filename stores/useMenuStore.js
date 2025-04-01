import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMenuStore = defineStore('menu', () => {
  // State
  const cafes = ref({});
  const menuData = ref({});
  const selectedItems = ref({});
  const loading = ref(false);
  const error = ref(null);
  const debug = ref({
    logs: [],
    errors: [],
    rawResponses: {}
  });

  // Logger-Funktionen
  function log(message) {
    console.log(message);
    debug.value.logs.push(`${new Date().toISOString().substr(11, 8)}: ${message}`);
  }

  function logError(message, error = null) {
    console.error(message, error);
    debug.value.errors.push(`${new Date().toISOString().substr(11, 8)}: ${message}`);
    if (error) {
      debug.value.errors.push(`Details: ${JSON.stringify(error)}`);
    }
  }

  // Getters
  const getCurrentCafe = computed(() => (slug) => cafes.value[slug] || null);
  
  const getMenuForCafe = computed(() => (slug) => {
    const cafe = cafes.value[slug];
    if (!cafe || !cafe.menu_section) return [];
    
    const menuId = cafe.menu_section.id;
    
    // Falls das Menü bereits im State ist, verwende es
    if (menuData.value[menuId]) {
      return menuData.value[menuId];
    }
    
    // Kein Menü gefunden
    return [];
  });
  
  const isItemSelected = computed(() => (menuId, categoryId, itemId) => {
    return !!(selectedItems.value[menuId]?.[categoryId]?.[itemId]);
  });

  // Verarbeite direkt das eingebettete Menü aus der Café-Antwort
  function processDirectMenuData(menuId, menuSection) {
    try {
      log(`Verarbeite eingebettetes Menü direkt`);
      
      if (!menuSection || !menuSection.menu || !Array.isArray(menuSection.menu)) {
        log(`Ungültige Menüstruktur: Kein Array von Kategorien gefunden`);
        return false;
      }
      
      // Format the categories
      menuData.value[menuId] = menuSection.menu.map(category => {
        // Bereite Menüitems aus menu_block vor
        const items = Array.isArray(category.menu_block) 
          ? category.menu_block.map(item => ({
              id: item.id,
              name: item.text || 'Unbenannter Artikel',
              description: item.subtext || '',
              price: item.price || '0,00 €',
              tags: item.extra?.vegan ? ['vegan'] : [],
              selected: false
            }))
          : [];
          
        return {
          id: category.id,
          title: category.menu_titel || 'Unbenannte Kategorie',
          items: items
        };
      });
      
      // Initialisiere ausgewählte Items
      if (!selectedItems.value[menuId]) {
        selectedItems.value[menuId] = {};
      }
      
      log(`Erfolgreich ${menuData.value[menuId].length} Kategorien verarbeitet mit insgesamt ${menuData.value[menuId].reduce((sum, cat) => sum + cat.items.length, 0)} Menüpunkten`);
      return true;
    } catch (err) {
      logError(`Fehler bei der Verarbeitung des direkten Menüs: ${err.message}`, err);
      return false;
    }
  }

  // Versucht, Menüdaten direkt mit findOne zu laden
  async function tryLoadMenuWithFindOne(menuId) {
    try {
      log(`Versuche direkten Zugriff auf menu_section mit ID: ${menuId} via findOne`);
      
      const { findOne } = useStrapi();
      
      // Try to load menu using pLevel
      try {
        log(`Versuche findOne mit Endpunkt menu-sections und pLevel`);
        const response = await findOne('menu-sections', menuId, { 
          pLevel: 10 // This should be enough for categories and items
        });
        
        // Für Debug speichern
        debug.value.rawResponses[`menu-sections-${menuId}`] = response;
        
        if (response && response.data) {
          log(`Erfolgreiche Antwort von menu-sections erhalten`);
          
          // Versuche, Menüdaten aus der Antwort zu extrahieren
          if (processApiMenuData(menuId, response.data, 'menu-sections')) {
            return true;
          }
        }
      } catch (err) {
        log(`Fehler bei menu-sections: ${err.message}`);
      }
      
      // Alternative approach for menu loading with pLevel
      try {
        log(`Versuche Alternative Methode über categories Endpunkt`);
        const response = await findOne('posts', menuId, {
          populate: {
            menu_section: {
              populate: '*'
            }
          },
          pLevel: 10 // Deep populate for complete menu structure
        });
        
        debug.value.rawResponses[`posts-menu-${menuId}`] = response;
        
        if (response && response.data && response.data.menu_section) {
          log(`Erfolgreiche Antwort über posts Endpunkt erhalten`);
          if (processApiMenuData(menuId, response.data.menu_section, 'posts-menu')) {
            return true;
          }
        }
      } catch (err) {
        log(`Fehler bei alternativer Methode: ${err.message}`);
      }
      
      // No successful API request
      return false;
    } catch (err) {
      logError(`Allgemeiner Fehler beim Laden des Menüs: ${err.message}`, err);
      return false;
    }
  }
  
  // Verarbeite API-Daten je nach Endpunkt
  function processApiMenuData(menuId, data, source) {
    try {
      log(`Verarbeite Daten von ${source}`);
      
      // Speichere Rohdaten für Debug
      debug.value.rawResponses[`processed-${source}-${menuId}`] = data;
      
      // Je nach Quelle unterschiedlich verarbeiten
      let extractedCategories = null;
      
      // Prüfe verschiedene mögliche Datenstrukturen
      if (data.attributes && data.attributes.categories && data.attributes.categories.data) {
        // Strapi v4 Format
        extractedCategories = data.attributes.categories.data;
      } else if (data.categories && Array.isArray(data.categories)) {
        // Einfaches Format
        extractedCategories = data.categories;
      } else if (data.attributes && data.attributes.categories) {
        // Anderes Format
        extractedCategories = data.attributes.categories;
      }
      
      if (extractedCategories) {
        // Kategorien in unser Format umwandeln
        menuData.value[menuId] = formatCategories(extractedCategories);
        
        // Initialisiere ausgewählte Menüpunkte
        if (!selectedItems.value[menuId]) {
          selectedItems.value[menuId] = {};
        }
        
        log(`${menuData.value[menuId].length} Kategorien erfolgreich verarbeitet`);
        return true;
      }
      
      // Keine passende Struktur gefunden
      log(`Keine passende Datenstruktur in Antwort von ${source} gefunden`);
      return false;
    } catch (err) {
      logError(`Fehler bei der Verarbeitung von ${source}-Daten: ${err.message}`, err);
      return false;
    }
  }
  
  // Formatiere Kategorien und Items
  function formatCategories(categories) {
    if (!categories || !Array.isArray(categories)) return [];
    
    return categories.map(category => {
      const attrs = category.attributes || category;
      const items = attrs.items?.data || attrs.items || [];
      
      return {
        id: category.id,
        title: attrs.title || attrs.name || 'Unbenannte Kategorie',
        sortOrder: attrs.sortOrder || attrs.sort_order || 0,
        items: formatItems(items)
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  
  function formatItems(items) {
    if (!items || !Array.isArray(items)) return [];
    
    return items.map(item => {
      const attrs = item.attributes || item;
      
      return {
        id: item.id,
        name: attrs.name || attrs.title || 'Unbenannter Artikel',
        description: attrs.description || '',
        price: attrs.price || '0,00 €',
        tags: attrs.tags?.data?.map(tag => tag.attributes?.name || tag.name) || 
              attrs.tags?.map(tag => tag.name || tag) || 
              attrs.tags || [],
        sortOrder: attrs.sortOrder || attrs.sort_order || 0,
        selected: false
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Lädt Café-Daten nach Slug
  async function fetchCafeBySlug(slug) {
    if (cafes.value[slug]) {
      log(`Café-Daten für ${slug} bereits geladen, verwende Cache`);
      return cafes.value[slug];
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      log(`Lade Café-Daten für slug: ${slug}`);
      
      const { find } = useStrapi();
      
      // Increase pLevel to ensure we get all nested data including menu_block
      const response = await find('posts', {
        filters: {
          slug: {
            $eq: slug
          }
        },
        pLevel: 10 // Increase depth significantly to ensure all nested data is included
      });
      
      if (response && response.data && response.data.length > 0) {
        const cafeData = response.data[0];
        log(`Café-Daten erfolgreich geladen: ${cafeData.shop_name}`);
        
        // Log the menu_section structure to debug
        log(`Menu section structure: ${JSON.stringify(cafeData.menu_section).substring(0, 200)}...`);
        
        // Speichere Café-Daten im Store
        cafes.value[slug] = cafeData;
        
        // Wenn eine Menü-ID vorhanden ist, versuche das Menü zu laden
        if (cafeData.menu_section && cafeData.menu_section.id) {
          const menuId = cafeData.menu_section.id;
          
          // Direkter Ansatz: Verarbeite das eingebettete Menü aus der Café-Antwort
          if (cafeData.menu_section.menu && Array.isArray(cafeData.menu_section.menu)) {
            log(`Verarbeite direkt das eingebettete Menü aus der Café-Antwort`);
            if (processDirectMenuData(menuId, cafeData.menu_section)) {
              return cafeData;
            }
          }
          
          // Fallback: Versuche separate API-Anfrage
          log(`Keine direkten Menüdaten verarbeitet. Versuche separate API-Anfrage...`);
          const apiSuccess = await tryLoadMenuWithFindOne(menuId);
          
          if (!apiSuccess) {
            // If we couldn't load the menu data but we have categories, create empty menu items
            if (cafeData.menu_section.menu && Array.isArray(cafeData.menu_section.menu)) {
              log(`Erstelle leere Menüeinträge für vorhandene Kategorien`);
              
              menuData.value[menuId] = cafeData.menu_section.menu.map(category => {
                return {
                  id: category.id,
                  title: category.menu_titel || 'Unbenannte Kategorie',
                  items: [] // Empty array for now
                };
              });
              
              // Initialize selected menu items
              if (!selectedItems.value[menuId]) {
                selectedItems.value[menuId] = {};
              }
              
              return cafeData;
            }
            
            log(`Keine Menüdaten gefunden für Café ${slug} mit menu_section ID ${menuId}`);
            error.value = "Keine Menüdaten für dieses Café verfügbar";
          }
        } else {
          logError(`Keine Menü-ID gefunden für Café: ${slug}`);
          error.value = 'Keine Menüdaten für dieses Café verfügbar';
        }
        
        return cafeData;
      } else {
        const errorMsg = `Kein Café mit dem Slug "${slug}" gefunden`;
        logError(errorMsg);
        error.value = errorMsg;
        return null;
      }
    } catch (err) {
      const errorMsg = `Fehler beim Laden der Café-Daten: ${err.message || 'Unbekannter Fehler'}`;
      logError(errorMsg, err);
      error.value = errorMsg;
      return null;
    } finally {
      loading.value = false;
    }
  }

  function toggleItemSelection(menuId, categoryId, itemId) {
    // Initialisiere die verschachtelten Objekte, falls sie nicht existieren
    if (!selectedItems.value[menuId]) {
      selectedItems.value[menuId] = {};
    }
    if (!selectedItems.value[menuId][categoryId]) {
      selectedItems.value[menuId][categoryId] = {};
    }
    
    // Toggle-Auswahl
    const currentValue = !!selectedItems.value[menuId][categoryId][itemId];
    selectedItems.value[menuId][categoryId][itemId] = !currentValue;
    
    log(`Menüpunkt ${itemId} in Kategorie ${categoryId} ${currentValue ? 'abgewählt' : 'ausgewählt'}`);
  }

  function clearError() {
    error.value = null;
  }

  function clearLogs() {
    debug.value.logs = [];
    debug.value.errors = [];
  }

  return {
    // State
    cafes,
    menuData,
    selectedItems,
    loading,
    error,
    debug,
    
    // Getters
    getCurrentCafe,
    getMenuForCafe,
    isItemSelected,
    
    // Actions
    fetchCafeBySlug,
    toggleItemSelection,
    clearError,
    clearLogs,
    log,
    logError
  };
});