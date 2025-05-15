import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './src/routes/auth.js'
import adminRoutes from './src/routes/admin.js'
import roomRoutes from './src/routes/room.js'
import publicRoutes from './src/routes/public.js'
import { verifyToken } from './src/middleware/auth.js'
import { setupSocketHandlers } from './src/socket/handlers.js'

// Create express app
const app = express()
const server = http.createServer(app)

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/gossip'

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err))

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
})

// Routes
app.use('/api/auth', authRoutes)
// Remove the verifyToken middleware here - it's now in the admin routes file
app.use('/api/admin', adminRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/public', publicRoutes)

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal server error' })
})

// Set up Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
})

// Set up socket handlers
setupSocketHandlers(io)

// Start server
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default server