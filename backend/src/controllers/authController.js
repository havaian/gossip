// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// JWT secret and expiration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const TOKEN_EXPIRY = '24h' // 24 hours to match frontend

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            email: user.email,
            iat: Math.floor(Date.now() / 1000) // issued at
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    )
}

// Decode token to get expiry time
const getTokenExpiry = (token) => {
    try {
        const decoded = jwt.decode(token)
        return new Date(decoded.exp * 1000) // Convert to milliseconds
    } catch (error) {
        return null
    }
}

// Create initial users if they don't exist
export const createInitialUsers = async () => {
    try {
        const count = await User.countDocuments()

        // Only create initial users if no users exist
        if (count === 0) {
            console.log('Creating initial users...')

            const initialUsers = [
                {
                    name: 'Admin User',
                    email: 'admin@gossip.mun.uz',
                    password: 'Admin123!',
                    role: 'admin'
                },
                {
                    name: 'Moderator User',
                    email: 'moderator@gossip.mun.uz',
                    password: 'Mod123!',
                    role: 'moderator'
                },
                {
                    name: 'Presenter User',
                    email: 'presenter@gossip.mun.uz',
                    password: 'Present123!',
                    role: 'presenter'
                }
            ]

            // Create users
            for (const userData of initialUsers) {
                const existingUser = await User.findOne({ email: userData.email })
                if (!existingUser) {
                    const user = new User(userData)
                    await user.save()
                    console.log(`Created user: ${userData.email}`)
                }
            }

            console.log('Initial users created successfully')
        }
    } catch (error) {
        console.error('Error creating initial users:', error)
    }
}

createInitialUsers();

// Register new user (admin only)
export const register = async (req, res) => {
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
            createdBy: req.user ? req.user.id : null
        })

        await user.save()

        // Generate JWT token
        const token = generateToken(user)
        const tokenExpiry = getTokenExpiry(token)

        res.status(201).json({
            message: 'User registered successfully',
            token,
            tokenExpiry: tokenExpiry?.toISOString(),
            user: user.toJSON()
        })
    } catch (error) {
        console.error('Registration error:', error)
        res.status(500).json({ message: 'Registration failed' })
    }
}

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        // Find user by email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is disabled' })
        }

        // Check password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Update last login time
        user.lastLogin = Date.now()
        await user.save()

        // Generate JWT token
        const token = generateToken(user)
        const tokenExpiry = getTokenExpiry(token)

        res.json({
            message: 'Login successful',
            token,
            tokenExpiry: tokenExpiry?.toISOString(),
            user: user.toJSON()
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Login failed' })
    }
}

// Get user profile
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('assignedRoom', 'name description')

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json(user)
    } catch (error) {
        console.error('Get user error:', error)
        res.status(500).json({ message: 'Failed to get user profile' })
    }
}

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' })
        }

        // Find user
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword)
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' })
        }

        // Update password
        user.password = newPassword
        await user.save()

        res.json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error('Change password error:', error)
        res.status(500).json({ message: 'Failed to change password' })
    }
}

// Refresh token (optional endpoint for token renewal)
export const refreshToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user || !user.isActive) {
            return res.status(404).json({ message: 'User not found or inactive' })
        }

        // Generate new token
        const token = generateToken(user)
        const tokenExpiry = getTokenExpiry(token)

        res.json({
            message: 'Token refreshed successfully',
            token,
            tokenExpiry: tokenExpiry?.toISOString(),
            user: user.toJSON()
        })
    } catch (error) {
        console.error('Refresh token error:', error)
        res.status(500).json({ message: 'Failed to refresh token' })
    }
}

// Verify token validity (useful for frontend to check token status)
export const verifyTokenValidity = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid token' })
        }

        res.json({
            valid: true,
            user: user.toJSON(),
            expiresAt: new Date(req.user.exp * 1000).toISOString()
        })
    } catch (error) {
        console.error('Verify token error:', error)
        res.status(500).json({ message: 'Failed to verify token' })
    }
}