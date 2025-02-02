// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  typescript: { strict: true },
  runtimeConfig: {
    public: {
      loginURL: process.env.LOGIN_URL,
      registerURL: process.env.REGISTER_URL,
      createRoomURL: process.env.CREATE_ROOM_URL,
      joinRoomURL: process.env.JOIN_ROOM_URL,
      getRoomsURL: process.env.GET_ROOMS_URL,
    },
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxtjs/color-mode'],
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'nuxt-color-mode',
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
});
