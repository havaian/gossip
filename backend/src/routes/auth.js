// backend/src/routes/auth.js
import express from 'express'
import {
    register,
    login,
    getMe,
    changePassword,
    refreshToken,
    verifyTokenValidity
} from '../controllers/authController.js'
import { verifyToken, isAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/login', login)

// Protected routes
router.post('/register', verifyToken, isAdmin, register)
router.get('/me', verifyToken, getMe)
router.post('/change-password', verifyToken, changePassword)
router.post('/refresh-token', verifyToken, refreshToken)
router.get('/verify-token', verifyToken, verifyTokenValidity)

export default router