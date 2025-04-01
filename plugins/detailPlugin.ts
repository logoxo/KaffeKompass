export default defineNuxtPlugin(nuxtApp => {
  const store = useStore();

  // State mit eindeutigen Namen
  const currentDetailId = ref(null);
  const isDetailOpen = ref(false);

  // Debug-Hilfsfunktion
  const logState = (label = "State") => {
    console.log(`[${label}] isOpen: ${isDetailOpen.value}, currentId: ${currentDetailId.value}`);
  };

  // Detail komplett schließen
  const closeDetail = () => {
    console.log("CLOSING DETAIL");
    
    const detailIndex = store.posts.findIndex(x => x.kind === 'ProductDetail');
    if (detailIndex >= 0) {
      store.removeProductDetail(detailIndex);
    }
    
    isDetailOpen.value = false;
    currentDetailId.value = null;
    
    logState("After Close");
    return true;
  };

  // Ermittle die tatsächliche Anzahl von Elementen pro Zeile im DOM
  const getActualItemsPerRow = () => {
    // Fallback-Werte basierend auf Bildschirmbreite
    const width = window.innerWidth;
    let fallbackItems = 4; // Default
    
    if (width >= 1280) fallbackItems = 4;
    else if (width >= 1024) fallbackItems = 4; // Angepasst von 3 auf 4 gemäß Ihrem Layout
    else if (width >= 768) fallbackItems = 2;
    else fallbackItems = 1;
    
    try {
      // Versuche, die Produktelemente im DOM zu finden
      const productElements = document.querySelectorAll('[class*="grid"] > div:not([class*="detail"])');
      
      if (!productElements || productElements.length < 2) {
        console.log("Nicht genügend Produktelemente gefunden, verwende Fallback:", fallbackItems);
        return fallbackItems;
      }
      
      // Die ersten beiden Elemente sollten in der ersten Zeile sein
      const firstRect = productElements[0].getBoundingClientRect();
      let itemsInFirstRow = 1; // Zähle das erste Element
      
      // Zähle alle Elemente in der ersten Zeile (gleiche y-Position)
      for (let i = 1; i < productElements.length; i++) {
        const rect = productElements[i].getBoundingClientRect();
        if (Math.abs(rect.top - firstRect.top) < 5) { // 5px Toleranz
          itemsInFirstRow++;
        } else {
          break; // Wir haben die erste Zeile verlassen
        }
      }
      
      console.log(`DOM-basierte Elemente pro Zeile: ${itemsInFirstRow}`);
      return itemsInFirstRow > 0 ? itemsInFirstRow : fallbackItems;
    } catch (error) {
      console.error("Fehler bei DOM-Analyse:", error);
      return fallbackItems;
    }
  };

  // Berechne die Zielposition für das Detail
  const calculateTargetPosition = (productId) => {
    // Tatsächliche Elemente pro Zeile im DOM ermitteln
    const itemsPerRow = getActualItemsPerRow();
    
    // Finde alle regulären Produkte (keine Details)
    const regularProducts = store.posts.filter(post => post.kind !== 'ProductDetail');
    
    // Finde den Index des angeklickten Produkts
    const productIndex = regularProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      console.error("Produkt nicht gefunden:", productId);
      return store.posts.length;
    }
    
    // Berechne die aktuelle Zeile und das Ende dieser Zeile
    const currentRow = Math.floor(productIndex / itemsPerRow);
    const endOfRowPosition = (currentRow + 1) * itemsPerRow;
    
    console.log(`Produkt an Index ${productIndex}, in Zeile ${currentRow + 1}`);
    console.log(`Elemente pro Zeile: ${itemsPerRow}, Ende der Zeile: ${endOfRowPosition}`);
    
    // Berechne die Position im originalen Array (mit möglichen Details)
    let targetPosition = 0;
    let regularCount = 0;
    
    for (let i = 0; i < store.posts.length; i++) {
      if (store.posts[i].kind !== 'ProductDetail') {
        regularCount++;
      }
      
      if (regularCount > endOfRowPosition) {
        targetPosition = i;
        break;
      }
    }
    
    // Wenn wir keine Position gefunden haben (z.B. am Ende des Arrays)
    if (targetPosition === 0) {
      targetPosition = store.posts.length;
    }
    
    console.log(`Berechnete Zielposition: ${targetPosition}`);
    return targetPosition;
  };

  // Funktion, um zum Produktdetail zu scrollen
  const scrollToDetail = () => {
    setTimeout(() => {
      // Versuche, das Produktdetail-Element zu finden
      const detailElement = document.querySelector('.product-detail');
      
      if (detailElement) {
        console.log("Scrolling to product detail");
        
        // Ermittle die Position des Elements relativ zum Dokument
        const rect = detailElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const detailTop = rect.top + scrollTop;
        
        // Berechne die gewünschte Scroll-Position
        // Wir wollen deutlich über dem Element scrollen, damit es nicht von der Navigation überdeckt wird
        
        // Berechne die Höhe der Navigation
        const headerElement = document.querySelector('#header') || document.querySelector('header');
        const headerHeight = headerElement ? headerElement.offsetHeight : 140; // Fallback, wenn nicht gefunden
        
        // Füge zusätzlichen Abstand hinzu
        const extraPadding = 30;
        const scrollPosition = detailTop - (headerHeight + extraPadding);
        
        // Scrolle sanft zur Position
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      } else {
        console.log("Product detail element not found");
      }
    }, 100); // Verzögere das Scrollen leicht, damit das Element im DOM gerendert wird
  };

  // Neues Detail öffnen
  const openDetail = (position, product) => {
    console.log("OPENING DETAIL", product.id, "at position", position);
    
    if (!product || !product.id) {
      console.error("Invalid product object", product);
      return false;
    }
    
    // Detailobjekt erstellen
    const detailObj = { ...product, kind: 'ProductDetail' };
    
    // In den Store einfügen
    store.update({
      index: position,
      obj: detailObj
    });
    
    // State aktualisieren
    isDetailOpen.value = true;
    currentDetailId.value = product.id;
    
    // Zum neu geöffneten Detail scrollen
    scrollToDetail();
    
    logState("After Open");
    return true;
  };

  // Detail aktualisieren (wenn ein anderes Produkt geklickt wird)
  const updateDetail = (product) => {
    console.log("UPDATING DETAIL to product", product.id);
    
    // Erst schließen wir das alte Detail
    const detailIndex = store.posts.findIndex(x => x.kind === 'ProductDetail');
    if (detailIndex >= 0) {
      store.removeProductDetail(detailIndex);
    }
    
    // Dann berechnen wir die neue Position und öffnen ein neues Detail
    const targetPosition = calculateTargetPosition(product.id);
    setTimeout(() => {
      openDetail(targetPosition, product);
      // Das Scrollen wird in openDetail aufgerufen
    }, 50);
    
    return true;
  };

  // Hauptfunktion zum Verarbeiten von Produkt-Klicks
  const productSetup = (product) => {
    if (!product) {
      console.error("Product is undefined in productSetup");
      return false;
    }
    
    const productId = product.id;
    logState("Before Action");
    
    console.log(`Product clicked: ${productId}`);
    
    // FALL 1: Selbes Produkt nochmal geklickt → schließen
    if (currentDetailId.value === productId && isDetailOpen.value) {
      console.log("CASE 1: Same product clicked again - closing");
      return closeDetail();
    }
    
    // FALL 2: Detail ist bereits offen (aber anderes Produkt) → Detail aktualisieren
    if (isDetailOpen.value && currentDetailId.value !== productId) {
      console.log("CASE 2: Different product clicked while detail is open - updating");
      return updateDetail(product);
    }
    
    // FALL 3: Kein Detail ist offen → einfach öffnen
    console.log("CASE 3: No detail open - opening new one");
    const targetPosition = calculateTargetPosition(productId);
    return openDetail(targetPosition, product);
  };

  // Window-Resize-Handler mit Debounce
  let resizeTimeout = null;
  const handleResize = () => {
    // Debounce implementieren
    if (resizeTimeout) clearTimeout(resizeTimeout);
    
    resizeTimeout = setTimeout(() => {
      console.log(`Window resized to ${window.innerWidth}px`);
      
      // Wenn ein Detail geöffnet ist, Position aktualisieren
      if (isDetailOpen.value && currentDetailId.value) {
        const product = store.posts.find(p => p.id === currentDetailId.value && p.kind !== 'ProductDetail');
        if (product) {
          updateDetail(product);
        }
      }
    }, 150); // 150ms Debounce
  };

  // Setup beim Plugin-Start
  if (process.client) {
    // Event-Listener für Resize hinzufügen
    window.addEventListener('resize', handleResize);
    
    // Cleanup beim App-Unmount
    nuxtApp.hook('app:unmounted', () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    });
  }

  // Provide the reactive state globally
  return {
    provide: {
      isDetailOpen,
      currentDetailId,
      productSetup,
      closeDetail
    }
  };
});