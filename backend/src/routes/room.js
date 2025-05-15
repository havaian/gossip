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
import { verifyToken, hasRoomAccess, hasModeratorAccess, isModerator } from '../middleware/auth.js'

const router = express.Router()

// Routes all authenticated users can access (admin, moderator, presenter)
router.get('/:id', verifyToken, hasRoomAccess, getRoomDetails)
router.get('/:id/current-message', verifyToken, hasRoomAccess, getCurrentMessage)

// Routes only moderators and admins can access
router.get('/:id/messages', verifyToken, hasRoomAccess, hasModeratorAccess, getRoomMessages)
router.patch('/:id/messages/:messageId/approve', verifyToken, hasRoomAccess, hasModeratorAccess, approveMessage)
router.patch('/:id/messages/:messageId/reject', verifyToken, hasRoomAccess, hasModeratorAccess, rejectMessage)
router.patch('/:id/messages/:messageId/display', verifyToken, hasRoomAccess, hasModeratorAccess, displayMessage)
router.patch('/:id/toggle-accepting', verifyToken, hasRoomAccess, hasModeratorAccess, toggleAcceptingMessages)
router.delete('/:id/messages', verifyToken, hasRoomAccess, hasModeratorAccess, clearAllMessages)

export default router