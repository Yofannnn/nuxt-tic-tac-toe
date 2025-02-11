import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const websocketURL = useRuntimeConfig().public.connectWebSocketGameURL;
  const socket = io(websocketURL, {
    withCredentials: true,
    transports: ['websocket'],
    autoConnect: false,
  });

  return {
    provide: {
      socket,
    },
  };
});
