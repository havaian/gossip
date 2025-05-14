import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './style.css'

// Create Vue app
const app = createApp(App)

// Configure toast notifications
const toastOptions = {
    position: 'top-right',
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
}

// Use plugins
app.use(createPinia())
app.use(router)
app.use(Toast, toastOptions)

// Mount the app
app.mount('#app')