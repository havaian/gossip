import axios from 'axios'

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// Add interceptor to set auth token on requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const originalRequest = error.config

        // Handle token expiration
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // Token expired, redirect to login
            localStorage.removeItem('token')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default api