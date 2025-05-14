import express from 'express'
import { getPublicRoomDetails, submitMessage } from '../controllers/publicController.js'

const router = express.Router()

// Public routes
router.get('/rooms/:id', getPublicRoomDetails)
router.post('/rooms/:id/message', submitMessage)

export default router