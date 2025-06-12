// frontend/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { io } from 'socket.io-client'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

// Socket.IO setup
const socket = io('https://gossip.mun.uz', {
    autoConnect: false,
    reconnection: true,
    path: '/socket.io/',
    transports: ['websocket', 'polling']
});

app.provide('socket', socket)
app.use(pinia)

// Initialize auth store after pinia is installed
const authStore = useAuthStore()
authStore.initialize()

app.use(router)
app.mount('#app')