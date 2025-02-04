import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon'
  ],
  css: ['~/styles/global.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  devtools: { enabled: true }
})
