import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

let io

// Set up socket handlers
export const setupSocketHandlers = (socketIo) => {
    io = socketIo

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token

            if (!token) {
                return next(new Error('Authentication error'))
            }

            const decoded = jwt.verify(token, JWT_SECRET)
            socket.user = decoded

            // Find user
            const user = await User.findById(decoded.id)
            if (!user || !user.isActive) {
                return next(new Error('User not found or inactive'))
            }

            next()
        } catch (error) {
            console.error('Socket authentication error:', error)
            next(new Error('Authentication error'))
        }
    })

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`)

        // Join room
        socket.on('join-room', async (data) => {
            try {
                const { roomId } = data

                // Join socket room
                socket.join(roomId)
                console.log(`Socket ${socket.id} joined room ${roomId}`)
            } catch (error) {
                console.error('Join room error:', error)
            }
        })

        // Leave room
        socket.on('leave-room', (data) => {
            try {
                const { roomId } = data

                // Leave socket room
                socket.leave(roomId)
                console.log(`Socket ${socket.id} left room ${roomId}`)
            } catch (error) {
                console.error('Leave room error:', error)
            }
        })

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`)
        })
    })

    return io
}

// Get IO instance
export const getIo = () => {
    if (!io) {
        console.error('IO not initialized')
        return null
    }
    return io
}