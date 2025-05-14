import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import api from '../services/api'
import jwtDecode from 'jwt-decode'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', () => {
    const toast = useToast()

    // State
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)

    // Getters
    const isAuthenticated = computed(() => !!token.value)
    const userRole = computed(() => user.value?.role || null)

    // Actions
    async function login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials)

            if (response.data.token) {
                setToken(response.data.token)
                await getUserDetails()
                toast.success('Login successful')
                return true
            }
            return false
        } catch (error) {
            console.error('Login error:', error)
            const message = error.response?.data?.message || 'Login failed'
            toast.error(message)
            return false
        }
    }

    async function register(userData) {
        try {
            const response = await api.post('/auth/register', userData)

            if (response.data.token) {
                setToken(response.data.token)
                await getUserDetails()
                toast.success('Registration successful')
                return true
            }
            return false
        } catch (error) {
            console.error('Registration error:', error)
            const message = error.response?.data?.message || 'Registration failed'
            toast.error(message)
            return false
        }
    }

    async function logout() {
        user.value = null
        token.value = null
        localStorage.removeItem('token')
        toast.info('You have been logged out')
    }

    async function checkAuth() {
        if (token.value) {
            try {
                // Check if token is expired
                const decodedToken = jwtDecode(token.value)
                const currentTime = Date.now() / 1000

                if (decodedToken.exp < currentTime) {
                    // Token is expired
                    logout()
                    return false
                }

                // Token is valid, get user details
                await getUserDetails()
                return true
            } catch (error) {
                console.error('Token validation error:', error)
                logout()
                return false
            }
        }
        return false
    }

    async function getUserDetails() {
        try {
            const response = await api.get('/auth/me')
            user.value = response.data
            return response.data
        } catch (error) {
            console.error('Get user details error:', error)
            logout()
            throw error
        }
    }

    function setToken(newToken) {
        token.value = newToken
        localStorage.setItem('token', newToken)

        // Set default Authorization header for all future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    }

    return {
        user,
        token,
        isAuthenticated,
        userRole,
        login,
        register,
        logout,
        checkAuth,
        getUserDetails
    }
})