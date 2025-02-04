
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/ui',
    '@nuxtjs/tailwindcss'
  ],
  css: ['~/styles/global.css'],
  devtools: { enabled: true }
})
