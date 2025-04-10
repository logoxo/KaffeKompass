<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header mit Titel -->
    <div class="py-16 text-center" style="background-color: #272121;">
      <h1 class="text-white text-5xl font-light">Impressum</h1>
    </div>

    <!-- Impressum content mit weißem Hintergrund -->
    <div class="bg-white flex-grow p-6 md:p-12 rounded-t-3xl -mt-4">
      <div class="max-w-4xl mx-auto">
        <!-- Nur Zurück-Button -->
        <div class="mb-6">
          <NuxtLink to="/" class="text-[#cc785c] hover:text-[#a66249] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Zurück zur Übersicht
          </NuxtLink>
        </div>

        <!-- Impressum Inhalt -->
        <div class="space-y-8 text-black">
          <section>
            <h2 class="text-2xl font-bold mb-4">Angaben gemäß § 5 TMG</h2>
            <p class="mb-2">Kalume Mukadi</p>
            <p class="mb-2">Neusser Landstr. 403</p>
            <p class="mb-2">50769 Köln</p>
          </section>

          <section>
            <h2 class="text-2xl text-black font-bold mb-4">Kontakt</h2>
            <p class="mb-2">E-Mail: info(at)mustermann.de</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Verantwortlich für den Inhalt</h2>
            <p class="mb-2">Kalume Mukadi</p>
            <p class="mb-2">Neusser Landstr. 403</p>
            <p class="mb-2">50769 Köln</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Hinweis</h2>
            <p class="mb-4">Diese Website wird als privates Hobby-Projekt betrieben und verfolgt keine kommerziellen Zwecke.</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Haftung für Inhalte</h2>
            <p class="mb-4">Als Betreiber dieser Seiten bin ich bemüht, die Inhalte meiner Seiten aktuell und korrekt zu halten. Sollten trotz meiner Bemühungen fehlerhafte Inhalte auf diesen Seiten vorhanden sein, kann ich dafür keine Haftung übernehmen. Die Inhalte dienen lediglich der Information.</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Haftung für Links</h2>
            <p>Mein Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Links umgehend entfernen.</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Urheberrecht</h2>
            <p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
            <p class="mt-4">Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitte ich um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Inhalte umgehend entfernen.</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Datenschutz</h2>
            <p>Diese Webseite erfasst und speichert keine personenbezogenen Daten der Besucher. Es werden keine Cookies gesetzt und kein Tracking eingesetzt.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO setup
const { $setSeo, $generateSeoTags } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const baseUrl = runtimeConfig.public.siteUrl || '';

// Set SEO tags
onMounted(() => {
  const seoTags = $generateSeoTags({
    title: 'Impressum | Private Hobby-Website',
    description: 'Rechtliche Informationen und Kontaktdaten für diese private Hobby-Website.',
    keywords: 'impressum, kontakt, rechtliche informationen, hobby-projekt',
    canonical: '/impressum',
    ogType: 'website',
    twitterCard: 'summary'
  });
  
  $setSeo(seoTags);
});
</script>

<style scoped>
/* Stile werden über Tailwind CSS gehandhabt */
</style>