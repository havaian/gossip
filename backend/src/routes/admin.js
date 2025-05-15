import express from 'express'
import {
    getStats,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
} from '../controllers/adminController.js'
import { verifyToken, isAdmin } from '../middleware/auth.js'

const router = express.Router()

// Verify token for all routes
router.use(verifyToken)

// Routes that all authenticated users (incl. moderators and presenters) can access
router.get('/rooms', getRooms)
router.get('/rooms/:id', getRoomById)

// Routes that require admin role
router.get('/stats', isAdmin, getStats)
router.get('/users', isAdmin, getUsers)
router.get('/users/:id', isAdmin, getUserById)
router.post('/users', isAdmin, createUser)
router.put('/users/:id', isAdmin, updateUser)
router.delete('/users/:id', isAdmin, deleteUser)
router.post('/rooms', isAdmin, createRoom)
router.put('/rooms/:id', isAdmin, updateRoom)
router.delete('/rooms/:id', isAdmin, deleteRoom)

export default router