import { defineStore } from 'pinia'
import axios from 'axios'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user'))
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin',
        isModerator: (state) => state.user?.role === 'moderator',
        isPresenter: (state) => state.user?.role === 'presenter'
    },

    actions: {
        async login(email, password) {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                    email,
                    password
                })

                this.token = response.data.token
                this.user = response.data.user

                localStorage.setItem('token', this.token)
                localStorage.setItem('user', JSON.stringify(this.user))

                return response.data
            } catch (error) {
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