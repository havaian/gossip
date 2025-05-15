import Room from '../models/Room.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { getIo } from '../socket/handlers.js'

// Get room details
export const getRoomDetails = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        res.json(room)
    } catch (error) {
        console.error('Get room details error:', error)
        res.status(500).json({ message: 'Failed to get room details' })
    }
}

// Get messages for a room
export const getRoomMessages = async (req, res) => {
    try {
        const { status, limit = 100, page = 1 } = req.query
        const skip = (page - 1) * limit

        // Check if room exists
        const room = await Room.findById(req.params.id)
        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        // Check if user has access to the room
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        
        // Allow access for admin, moderator and presenter roles without checking room assignment
        if (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'presenter') {
            // For any future roles that might be added, check assignment
            if (!user.assignedRoom || !user.assignedRoom.equals(room._id)) {
                return res.status(403).json({ message: 'Access denied' })
            }
        }

        // Build query
        let query = { room: req.params.id }
        if (status) {
            query.status = status
        }

        // Get messages
        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('approvedBy', 'name')
            .populate('rejectedBy', 'name')

        res.json(messages)
    } catch (error) {
        console.error('Get room messages error:', error)
        res.status(500).json({ message: 'Failed to get messages' })
    }
}

// Get current message being displayed
export const getCurrentMessage = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('currentMessage')

        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        if (!room.currentMessage) {
            return res.json(null)
        }

        res.json(room.currentMessage)
    } catch (error) {
        console.error('Get current message error:', error)
        res.status(500).json({ message: 'Failed to get current message' })
    }
}

// Approve a message
export const approveMessage = async (req, res) => {
    try {
        // Find message
        const message = await Message.findById(req.params.messageId)
        if (!message) {
            return res.status(404).json({ message: 'Message not found' })
        }

        // Check if message belongs to the specified room
        if (message.room.toString() !== req.params.id) {
            return res.status(400).json({ message: 'Message does not belong to this room' })
        }

        // Update message status
        message.status = 'approved'
        message.approvedBy = req.user.id
        message.approvedAt = Date.now()

        await message.save()

        // Get IO instance
        const io = getIo()
        if (io) {
            io.to(req.params.id).emit('message-update', message)
        }

        res.json({
            message: 'Message approved successfully',
            data: message
        })
    } catch (error) {
        console.error('Approve message error:', error)
        res.status(500).json({ message: 'Failed to approve message' })
    }
}

// Reject a message
export const rejectMessage = async (req, res) => {
    try {
        // Find message
        const message = await Message.findById(req.params.messageId)
        if (!message) {
            return res.status(404).json({ message: 'Message not found' })
        }

        // Check if message belongs to the specified room
        if (message.room.toString() !== req.params.id) {
            return res.status(400).json({ message: 'Message does not belong to this room' })
        }

        // Update message status
        message.status = 'rejected'
        message.rejectedBy = req.user.id
        message.rejectedAt = Date.now()

        await message.save()

        // Get IO instance
        const io = getIo()
        if (io) {
            io.to(req.params.id).emit('message-update', message)
        }

        res.json({
            message: 'Message rejected successfully',
            data: message
        })
    } catch (error) {
        console.error('Reject message error:', error)
        res.status(500).json({ message: 'Failed to reject message' })
    }
}

// Display a message
export const displayMessage = async (req, res) => {
    try {
        // Find message
        const message = await Message.findById(req.params.messageId)
        if (!message) {
            return res.status(404).json({ message: 'Message not found' })
        }

        // Check if message belongs to the specified room
        if (message.room.toString() !== req.params.id) {
            return res.status(400).json({ message: 'Message does not belong to this room' })
        }

        // Check if message is approved
        if (message.status !== 'approved') {
            return res.status(400).json({ message: 'Only approved messages can be displayed' })
        }

        // Find room
        const room = await Room.findById(req.params.id)
        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        // Check current message and reset its displaying status
        if (room.currentMessage) {
            const currentMessage = await Message.findById(room.currentMessage)
            if (currentMessage) {
                currentMessage.isDisplaying = false
                await currentMessage.save()
            }
        }

        // Update message and room
        message.isDisplaying = true
        room.currentMessage = message._id

        await message.save()
        await room.save()

        // Get IO instance
        const io = getIo()
        if (io) {
            io.to(req.params.id).emit('display-message', message)
            io.to(req.params.id).emit('message-update', message)
        }

        res.json({
            message: 'Message is now displaying',
            data: message
        })
    } catch (error) {
        console.error('Display message error:', error)
        res.status(500).json({ message: 'Failed to display message' })
    }
}

// Toggle accepting messages
export const toggleAcceptingMessages = async (req, res) => {
    try {
        const { acceptingMessages } = req.body

        // Find room
        const room = await Room.findById(req.params.id)
        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        // Update room
        room.acceptingMessages = acceptingMessages

        await room.save()

        // Get IO instance
        const io = getIo()
        if (io) {
            io.to(req.params.id).emit('room-update', room)
        }

        res.json({
            message: `Room is ${acceptingMessages ? 'now' : 'no longer'} accepting messages`,
            room
        })
    } catch (error) {
        console.error('Toggle accepting messages error:', error)
        res.status(500).json({ message: 'Failed to update room status' })
    }
}

// Clear all messages in a room
export const clearAllMessages = async (req, res) => {
    try {
        // Find room
        const room = await Room.findById(req.params.id)
        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        // Reset current message
        room.currentMessage = null
        await room.save()

        // Delete all messages
        await Message.deleteMany({ room: req.params.id })

        // Get IO instance
        const io = getIo()
        if (io) {
            io.to(req.params.id).emit('messages-cleared', { roomId: req.params.id })
        }

        res.json({ message: 'All messages cleared successfully' })
    } catch (error) {
        console.error('Clear messages error:', error)
        res.status(500).json({ message: 'Failed to clear messages' })
    }
}