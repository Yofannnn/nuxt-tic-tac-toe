// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  typescript: { strict: true },
  runtimeConfig: {
    public: {
      loginURL: process.env.LOGIN_URL,
      registerURL: process.env.REGISTER_URL,
      getUserProfileURL: process.env.GET_USER_PROFILE_URL,
      createRoomURL: process.env.CREATE_ROOM_URL,
      joinRoomURL: process.env.JOIN_ROOM_URL,
      getRoomsURL: process.env.GET_ROOMS_URL,
      addFriendURL: process.env.ADD_FRIEND_URL,
      acceptFriendURL: process.env.ACCEPT_FRIEND_URL,
      rejectFriendURL: process.env.REJECT_FRIEND_URL,
      getUserFriendListURL: process.env.GET_USER_FRIEND_LIST_URL,
      getRequestFriendListURL: process.env.GET_REQUEST_FRIEND_LIST_URL,
      getUserMatchHistoryListURL: process.env.GET_USER_MATCH_HISTORY_LIST_URL,
      getUserDMListURL: process.env.GET_USER_DM_LIST_URL,
      connectWebSocketGameURL: process.env.CONNECT_WEB_SOCKET_GAME_URL,
      connectWebSocketDirectMessageURL: process.env.CONNECT_WEB_SOCKET_DIRECT_MESSAGE_URL,
    },
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxtjs/color-mode'],
  plugins: ['~/plugins/socket'],
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
