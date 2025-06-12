// frontend/src/stores/auth.js
import { defineStore } from 'pinia'
import { apiService } from '../services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user')),
        tokenExpiry: localStorage.getItem('tokenExpiry') ? new Date(localStorage.getItem('tokenExpiry')) : null
    }),

    getters: {
        isAuthenticated: (state) => {
            if (!state.token) return false

            // Check if token is expired
            if (state.tokenExpiry && new Date() >= state.tokenExpiry) {
                console.log('Token has expired')
                return false
            }

            return true
        },
        isAdmin: (state) => state.user?.role === 'admin',
        isModerator: (state) => state.user?.role === 'moderator',
        isPresenter: (state) => state.user?.role === 'presenter',

        // Time until token expires (in minutes)
        timeUntilExpiry: (state) => {
            if (!state.tokenExpiry) return null
            const now = new Date()
            const diff = state.tokenExpiry.getTime() - now.getTime()
            return Math.max(0, Math.floor(diff / (1000 * 60))) // minutes
        }
    },

    actions: {
        async login(email, password) {
            try {
                const response = await apiService.auth.login({ email, password })

                this.token = response.data.token
                this.user = response.data.user

                // Calculate token expiry (24 hours from now to match backend)
                const expiry = new Date()
                expiry.setHours(expiry.getHours() + 24)
                this.tokenExpiry = expiry

                // Store in localStorage
                localStorage.setItem('token', this.token)
                localStorage.setItem('user', JSON.stringify(this.user))
                localStorage.setItem('tokenExpiry', this.tokenExpiry.toISOString())

                // Set up auto-logout timer
                this.setAutoLogoutTimer()

                return response.data
            } catch (error) {
                throw error.response?.data?.message || 'Login failed'
            }
        },

        logout() {
            this.token = null
            this.user = null
            this.tokenExpiry = null

            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('tokenExpiry')

            // Clear any existing logout timer
            if (this.logoutTimer) {
                clearTimeout(this.logoutTimer)
                this.logoutTimer = null
            }
        },

        // Set up automatic logout when token expires
        setAutoLogoutTimer() {
            if (this.logoutTimer) {
                clearTimeout(this.logoutTimer)
            }

            if (this.tokenExpiry) {
                const timeUntilExpiry = this.tokenExpiry.getTime() - new Date().getTime()

                if (timeUntilExpiry > 0) {
                    this.logoutTimer = setTimeout(() => {
                        console.log('Token expired, logging out automatically')
                        this.logout()
                        // You might want to show a notification here
                        alert('Your session has expired. Please log in again.')
                        window.location.href = '/login'
                    }, timeUntilExpiry)
                }
            }
        },

        // Check if token will expire soon (within 5 minutes)
        isTokenExpiringSoon() {
            const timeLeft = this.timeUntilExpiry
            return timeLeft !== null && timeLeft <= 5
        },

        // Initialize the store (call this in main.js)
        initialize() {
            // Check if stored token is still valid
            if (this.token && !this.isAuthenticated) {
                this.logout()
            } else if (this.isAuthenticated) {
                // Set up auto-logout timer for existing session
                this.setAutoLogoutTimer()
            }
        },

        // Refresh user data
        async refreshUser() {
            try {
                const response = await apiService.auth.getMe()
                this.user = response.data
                localStorage.setItem('user', JSON.stringify(this.user))
                return response.data
            } catch (error) {
                console.error('Failed to refresh user data:', error)
                throw error
            }
        }
    }
})