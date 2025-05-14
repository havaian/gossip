import { io } from 'socket.io-client'
import { useAuthStore } from '../stores/auth'

// Initialize socket instance
let socket = null

// Create socket connection
export const initSocket = () => {
    const authStore = useAuthStore()

    if (!socket && authStore.token) {
        socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
            auth: {
                token: authStore.token
            },
            reconnectionDelay: 1000,
            reconnection: true,
            reconnectionAttempts: 10,
            transports: ['websocket'],
            agent: false,
            upgrade: false,
            rejectUnauthorized: false
        })

        // Event listeners for connection status
        socket.on('connect', () => {
            console.log('Socket connected')
        })

        socket.on('disconnect', (reason) => {
            console.log(`Socket disconnected: ${reason}`)
        })

        socket.on('error', (error) => {
            console.error('Socket error:', error)
        })

        socket.on('reconnect_attempt', (attempt) => {
            console.log(`Socket reconnection attempt ${attempt}`)
        })
    }

    return socket
}

// Get existing socket or create a new one
export const getSocket = () => {
    if (!socket) {
        return initSocket()
    }
    return socket
}

// Disconnect socket
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

// Room operations
export const joinRoom = (roomId) => {
    if (socket) {
        socket.emit('join-room', { roomId })
    }
}

export const leaveRoom = (roomId) => {
    if (socket) {
        socket.emit('leave-room', { roomId })
    }
}

export default {
    initSocket,
    getSocket,
    disconnectSocket,
    joinRoom,
    leaveRoom
}