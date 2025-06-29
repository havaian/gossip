import User from '../models/User.js'
import Room from '../models/Room.js'
import Message from '../models/Message.js'

// Get dashboard stats
export const getStats = async (req, res) => {
    try {
        const totalRooms = await Room.countDocuments()
        const activeRooms = await Room.countDocuments({ isActive: true })
        const totalUsers = await User.countDocuments()
        const totalMessages = await Message.countDocuments()

        res.json({
            totalRooms,
            activeRooms,
            totalUsers,
            totalMessages
        })
    } catch (error) {
        console.error('Get stats error:', error)
        res.status(500).json({ message: 'Failed to get stats' })
    }
}

// Get all users
export const getUsers = async (req, res) => {
    try {
        const { limit = 10, page = 1, role } = req.query
        const skip = (page - 1) * limit

        let query = {}
        if (role) {
            query.role = role
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password')

        const total = await User.countDocuments(query)

        res.json({
            users,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error('Get users error:', error)
        res.status(500).json({ message: 'Failed to get users' })
    }
}

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json(user)
    } catch (error) {
        console.error('Get user error:', error)
        res.status(500).json({ message: 'Failed to get user' })
    }
}

// Create user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        // Check if email already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' })
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: role || 'moderator',
            createdBy: req.user.id
        })

        await user.save()

        res.status(201).json({
            message: 'User created successfully',
            user: user.toJSON()
        })
    } catch (error) {
        console.error('Create user error:', error)
        res.status(500).json({ message: 'Failed to create user' })
    }
}

// Update user
export const updateUser = async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body

        // Find user
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Update user fields
        if (name) user.name = name
        if (email) user.email = email
        if (role) user.role = role
        if (isActive !== undefined) user.isActive = isActive

        await user.save()

        res.json({
            message: 'User updated successfully',
            user: user.toJSON()
        })
    } catch (error) {
        console.error('Update user error:', error)
        res.status(500).json({ message: 'Failed to update user' })
    }
}

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        await user.remove()

        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Delete user error:', error)
        res.status(500).json({ message: 'Failed to delete user' })
    }
}

// Get all rooms
export const getRooms = async (req, res) => {
    try {
        const { limit = 10, page = 1, isActive } = req.query
        const skip = (page - 1) * limit

        let query = {}
        if (isActive !== undefined) {
            query.isActive = isActive === 'true'
        }

        const rooms = await Room.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('creator', 'name')
            .populate('moderator', 'name')
            .populate('presenter', 'name')

        const total = await Room.countDocuments(query)

        res.json({
            rooms,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error('Get rooms error:', error)
        res.status(500).json({ message: 'Failed to get rooms' })
    }
}

// Create room
export const createRoom = async (req, res) => {
    try {
        const { name, description } = req.body

        // // Create moderator
        // const moderator = new User({
        //     name: `${name} Moderator`,
        //     email: `moderator-${Date.now()}@anonymous.com`,
        //     password: Math.random().toString(36).slice(-8),
        //     role: 'moderator',
        //     createdBy: req.user.id
        // })

        // // Create presenter
        // const presenter = new User({
        //     name: `${name} Presenter`,
        //     email: `presenter-${Date.now()}@anonymous.com`,
        //     password: Math.random().toString(36).slice(-8),
        //     role: 'presenter',
        //     createdBy: req.user.id
        // })

        // // Save users
        // await moderator.save()
        // await presenter.save()

        // Create room
        const room = new Room({
            name,
            description,
            creator: req.user.id,
            moderator: moderator._id,
            presenter: presenter._id
        })

        // Save room
        await room.save()

        // // Update user assignments
        // moderator.assignedRoom = room._id
        // presenter.assignedRoom = room._id

        // await moderator.save()
        // await presenter.save()

        res.status(201).json({
            message: 'Room created successfully',
            room,
            // moderator: moderator.toJSON(),
            // presenter: presenter.toJSON()
        })
    } catch (error) {
        console.error('Create room error:', error)
        res.status(500).json({ message: 'Failed to create room' })
    }
}

// Get room by ID
export const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('creator', 'name')
            .populate('moderator', 'name email')
            .populate('presenter', 'name email')

        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        res.json(room)
    } catch (error) {
        console.error('Get room error:', error)
        res.status(500).json({ message: 'Failed to get room' })
    }
}

// Update room
export const updateRoom = async (req, res) => {
    try {
        const { name, description, isActive, acceptingMessages } = req.body

        // Find room
        const room = await Room.findById(req.params.id)
        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        // Update room fields
        if (name) room.name = name
        if (description) room.description = description
        if (isActive !== undefined) room.isActive = isActive
        if (acceptingMessages !== undefined) room.acceptingMessages = acceptingMessages

        await room.save()

        res.json({
            message: 'Room updated successfully',
            room
        })
    } catch (error) {
        console.error('Update room error:', error)
        res.status(500).json({ message: 'Failed to update room' })
    }
}

// Delete room
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        // Delete associated messages
        await Message.deleteMany({ room: room._id })

        // Delete room
        await await Room.findByIdAndDelete(req.params.id)

        res.json({ message: 'Room deleted successfully' })
    } catch (error) {
        console.error('Delete room error:', error)
        res.status(500).json({ message: 'Failed to delete room' })
    }
}