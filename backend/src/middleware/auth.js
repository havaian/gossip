// backend/src/middleware/auth.js
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
            return res.status(401).json({
                message: 'Access denied. No token provided.',
                code: 'NO_TOKEN'
            })
        }

        const token = authHeader.split(' ')[1]

        // Verify token
        let decoded
        try {
            decoded = jwt.verify(token, JWT_SECRET)
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Token has expired. Please log in again.',
                    code: 'TOKEN_EXPIRED'
                })
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    message: 'Invalid token.',
                    code: 'INVALID_TOKEN'
                })
            } else {
                return res.status(401).json({
                    message: 'Token verification failed.',
                    code: 'TOKEN_ERROR'
                })
            }
        }

        // Add user data to request
        req.user = decoded

        // Optionally verify user still exists and is active
        const user = await User.findById(decoded.id).select('isActive role')
        if (!user) {
            return res.status(401).json({
                message: 'User not found.',
                code: 'USER_NOT_FOUND'
            })
        }

        if (!user.isActive) {
            return res.status(401).json({
                message: 'Account is disabled.',
                code: 'ACCOUNT_DISABLED'
            })
        }

        // Update req.user with latest role (in case it changed)
        req.user.role = user.role

        next()
    } catch (error) {
        console.error('Token verification error:', error)
        res.status(500).json({
            message: 'Internal server error during authentication.',
            code: 'AUTH_ERROR'
        })
    }
}

// Check if user is admin
export const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Access denied. Admin privileges required.',
                code: 'INSUFFICIENT_PRIVILEGES'
            })
        }

        next()
    } catch (error) {
        console.error('Admin check error:', error)
        res.status(500).json({
            message: 'Internal server error during authorization.',
            code: 'AUTH_ERROR'
        })
    }
}

// Check if user is moderator or admin
export const isModerator = async (req, res, next) => {
    try {
        if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Access denied. Moderator privileges required.',
                code: 'INSUFFICIENT_PRIVILEGES'
            })
        }

        next()
    } catch (error) {
        console.error('Moderator check error:', error)
        res.status(500).json({
            message: 'Internal server error during authorization.',
            code: 'AUTH_ERROR'
        })
    }
}

// Check if user is presenter or admin
export const isPresenter = async (req, res, next) => {
    try {
        if (req.user.role !== 'presenter' && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Access denied. Presenter privileges required.',
                code: 'INSUFFICIENT_PRIVILEGES'
            })
        }

        next()
    } catch (error) {
        console.error('Presenter check error:', error)
        res.status(500).json({
            message: 'Internal server error during authorization.',
            code: 'AUTH_ERROR'
        })
    }
}

// Check if user has general room access (all roles)
export const hasRoomAccess = async (req, res, next) => {
    try {
        const roomId = req.params.id
        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                code: 'USER_NOT_FOUND'
            })
        }

        // Allow access to all rooms for admins, moderators, and presenters
        if (user.role === 'admin' || user.role === 'moderator' || user.role === 'presenter') {
            return next()
        }

        // For any other roles (if added in the future), check if user is assigned to the room
        if (!user.assignedRoom || user.assignedRoom.toString() !== roomId) {
            return res.status(403).json({
                message: 'You do not have access to this room.',
                code: 'ROOM_ACCESS_DENIED'
            })
        }

        next()
    } catch (error) {
        console.error('Room access check error:', error)
        res.status(500).json({
            message: 'Internal server error during room access check.',
            code: 'AUTH_ERROR'
        })
    }
}

// Check if user has moderator access to a room (admins and moderators only)
export const hasModeratorAccess = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                code: 'USER_NOT_FOUND'
            })
        }

        // Only admins and moderators can moderate rooms
        if (user.role !== 'admin' && user.role !== 'moderator') {
            return res.status(403).json({
                message: 'Access denied. Moderator privileges required.',
                code: 'MODERATOR_ACCESS_DENIED'
            })
        }

        next()
    } catch (error) {
        console.error('Moderator access check error:', error)
        res.status(500).json({
            message: 'Internal server error during moderator access check.',
            code: 'AUTH_ERROR'
        })
    }
}