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
import { isAdmin } from '../middleware/auth.js'

const router = express.Router()

// All routes in this file require admin role
router.use(isAdmin)

// Stats
router.get('/stats', getStats)

// User routes
router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

// Room routes
router.get('/rooms', getRooms)
router.get('/rooms/:id', getRoomById)
router.post('/rooms', createRoom)
router.put('/rooms/:id', updateRoom)
router.delete('/rooms/:id', deleteRoom)

export default router