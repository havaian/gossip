import Room from '../models/Room.js'
import Message from '../models/Message.js'
import { getIo } from '../socket/handlers.js'

// Get public room details
export const getPublicRoomDetails = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .select('name description isActive acceptingMessages')

        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        if (!room.isActive) {
            return res.status(403).json({ message: 'This room is not available' })
        }

        res.json(room)
    } catch (error) {
        console.error('Get public room details error:', error)
        res.status(500).json({ message: 'Failed to get room details' })
    }
}

// Submit a message to a room
export const submitMessage = async (req, res) => {
    try {
        const { content } = req.body

        // Check if room exists and is active
        const room = await Room.findById(req.params.id)
        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        if (!room.isActive) {
            return res.status(403).json({ message: 'This room is not available' })
        }

        if (!room.acceptingMessages) {
            return res.status(403).json({ message: 'This room is not accepting messages at this time' })
        }

        // Create new message
        const message = new Message({
            content,
            room: req.params.id,
            ipAddress: req.ip
        })

        await message.save()

        // Update room message count
        room.messageCount += 1
        await room.save()

        // Get IO instance
        const io = getIo()
        if (io) {
            io.to(req.params.id).emit('new-message', message)
        }

        res.status(201).json({
            message: 'Message submitted successfully',
            data: {
                id: message._id,
                status: message.status
            }
        })
    } catch (error) {
        console.error('Submit message error:', error)
        res.status(500).json({ message: 'Failed to submit message' })
    }
}