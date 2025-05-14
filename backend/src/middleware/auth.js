import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Verify JWT token
export const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' })
        }

        const token = authHeader.split(' ')[1]

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET)

        // Add user ID to request
        req.user = decoded

        next()
    } catch (error) {
        console.error('Token verification error:', error)
        res.status(401).json({ message: 'Invalid token' })
    }
}

// Check if user is admin
export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' })
        }

        next()
    } catch (error) {
        console.error('Admin check error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Check if user is moderator
export const isModerator = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)

        if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied' })
        }

        next()
    } catch (error) {
        console.error('Moderator check error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Check if user is presenter
export const isPresenter = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)

        if (!user || (user.role !== 'presenter' && user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied' })
        }

        next()
    } catch (error) {
        console.error('Presenter check error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Check if user has access to room
export const hasRoomAccess = async (req, res, next) => {
    try {
        const roomId = req.params.id
        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Admin has access to all rooms
        if (user.role === 'admin') {
            return next()
        }

        // Check if user is assigned to the room
        if (!user.assignedRoom || user.assignedRoom.toString() !== roomId) {
            return res.status(403).json({ message: 'You do not have access to this room' })
        }

        next()
    } catch (error) {
        console.error('Room access check error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}