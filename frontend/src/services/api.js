// frontend/src/services/api.js
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import router from '../router'

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const authStore = useAuthStore()

        // Handle 401 Unauthorized responses (token expired or invalid)
        if (error.response?.status === 401) {
            const errorMessage = error.response.data?.message?.toLowerCase() || ''

            // Check if it's a token expiration issue
            if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
                console.log('Token expired or invalid, logging out user')
                authStore.logout()
                router.push('/login')
            }
        }

        return Promise.reject(error)
    }
)

// API service methods
export const apiService = {
    // Auth endpoints
    auth: {
        login: (credentials) => api.post('/auth/login', credentials),
        register: (userData) => api.post('/auth/register', userData),
        getMe: () => api.get('/auth/me'),
        changePassword: (passwords) => api.post('/auth/change-password', passwords)
    },

    // Admin endpoints
    admin: {
        getStats: () => api.get('/admin/stats'),

        // Users
        getUsers: (params = {}) => api.get('/admin/users', { params }),
        getUserById: (id) => api.get(`/admin/users/${id}`),
        createUser: (userData) => api.post('/admin/users', userData),
        updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
        deleteUser: (id) => api.delete(`/admin/users/${id}`),

        // Rooms (admin)
        createRoom: (roomData) => api.post('/admin/rooms', roomData),
        updateRoom: (id, roomData) => api.put(`/admin/rooms/${id}`, roomData),
        deleteRoom: (id) => api.delete(`/admin/rooms/${id}`)
    },

    // Room endpoints
    rooms: {
        getRooms: (params = {}) => api.get('/admin/rooms', { params }),
        getRoomById: (id) => api.get(`/admin/rooms/${id}`),
        getRoomDetails: (id) => api.get(`/rooms/${id}`),
        getRoomMessages: (id, params = {}) => api.get(`/rooms/${id}/messages`, { params }),
        getCurrentMessage: (id) => api.get(`/rooms/${id}/current-message`),
        approveMessage: (roomId, messageId) => api.patch(`/rooms/${roomId}/messages/${messageId}/approve`),
        rejectMessage: (roomId, messageId) => api.patch(`/rooms/${roomId}/messages/${messageId}/reject`),
        displayMessage: (roomId, messageId) => api.patch(`/rooms/${roomId}/messages/${messageId}/display`),
        toggleAcceptingMessages: (id, acceptingMessages) => api.patch(`/rooms/${id}/toggle-accepting`, { acceptingMessages }),
        clearAllMessages: (id) => api.delete(`/rooms/${id}/messages`)
    },

    // Public endpoints
    public: {
        getRoomDetails: (id) => api.get(`/public/rooms/${id}`),
        submitMessage: (id, content) => api.post(`/public/rooms/${id}/message`, { content })
    }
}

export default api