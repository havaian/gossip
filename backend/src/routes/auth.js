import express from 'express'
import { register, login, getMe, changePassword } from '../controllers/authController.js'
import { verifyToken, isAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/login', login)

// Protected routes
router.post('/register', verifyToken, isAdmin, register)
router.get('/me', verifyToken, getMe)
router.post('/change-password', verifyToken, changePassword)

export default router