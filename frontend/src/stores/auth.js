import { defineStore } from 'pinia'
import axios from 'axios'
import { useRouter } from 'vue-router'

// Debug environment variables
console.log('Environment check:')
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL)
console.log('All env vars:', import.meta.env)

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user') || 'null') // Handle null case
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin',
        isModerator: (state) => state.user?.role === 'moderator',
        isPresenter: (state) => state.user?.role === 'presenter',
        
        // Add getter to check API URL
        apiUrl: () => {
            const url = import.meta.env.VITE_API_URL
            if (!url) {
                console.error('VITE_API_URL is not defined!')
                // Fallback URL
                return 'https://gossip.mun.uz/api'
            }
            return url
        }
    },

    actions: {
        async login(email, password) {
            try {
                const apiUrl = this.apiUrl
                console.log('Using API URL:', apiUrl)
                
                const response = await axios.post(`${apiUrl}/auth/login`, {
                    email,
                    password
                })

                this.token = response.data.token
                this.user = response.data.user

                localStorage.setItem('token', this.token)
                localStorage.setItem('user', JSON.stringify(this.user))

                return response.data
            } catch (error) {
                console.error('Login error:', error)
                throw error.response?.data?.message || 'Login failed'
            }
        },

        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }
})