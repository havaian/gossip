import express from 'express'
import {
    getRoomDetails,
    getRoomMessages,
    getCurrentMessage,
    approveMessage,
    rejectMessage,
    displayMessage,
    toggleAcceptingMessages,
    clearAllMessages
} from '../controllers/roomController.js'
import { verifyToken, hasRoomAccess, isModerator } from '../middleware/auth.js'

const router = express.Router()

// Protected routes
router.get('/:id', verifyToken, getRoomDetails)
router.get('/:id/messages', verifyToken, hasRoomAccess, getRoomMessages)
router.get('/:id/current-message', verifyToken, hasRoomAccess, getCurrentMessage)

// Moderator routes
router.patch('/:id/messages/:messageId/approve', verifyToken, hasRoomAccess, isModerator, approveMessage)
router.patch('/:id/messages/:messageId/reject', verifyToken, hasRoomAccess, isModerator, rejectMessage)
router.patch('/:id/messages/:messageId/display', verifyToken, hasRoomAccess, isModerator, displayMessage)
router.patch('/:id/toggle-accepting', verifyToken, hasRoomAccess, isModerator, toggleAcceptingMessages)
router.delete('/:id/messages', verifyToken, hasRoomAccess, isModerator, clearAllMessages)

export default router