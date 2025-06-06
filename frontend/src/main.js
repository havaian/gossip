import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { io } from 'socket.io-client'

const app = createApp(App)
const pinia = createPinia()

// Socket.IO setup
const socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    path: '/socket.io/',  // Explicitly set the path to match the server
    transports: ['websocket', 'polling']  // Specify transport methods
});

app.provide('socket', socket)
app.use(pinia)
app.use(router)
app.mount('#app')