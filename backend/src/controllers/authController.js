import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
    )
}

// Create or recreate initial users - ensures they always exist
export const createInitialUsers = async () => {
    try {
        console.log('Checking and creating/updating initial users...')
        
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
        
        // Create or update each initial user
        for (const userData of initialUsers) {
            try {
                const existingUser = await User.findOne({ email: userData.email })
                
                if (existingUser) {
                    // Update existing user to ensure it has correct role and is active
                    existingUser.name = userData.name
                    existingUser.role = userData.role
                    existingUser.isActive = true
                    
                    // Only update password if it's different (this will trigger the pre-save hash)
                    const isPasswordSame = await existingUser.comparePassword(userData.password)
                    if (!isPasswordSame) {
                        existingUser.password = userData.password
                    }
                    
                    await existingUser.save()
                    console.log(`✅ Updated existing user: ${userData.email}`)
                } else {
                    // Create new user
                    const user = new User(userData)
                    await user.save()
                    console.log(`✅ Created new user: ${userData.email}`)
                }
            } catch (userError) {
                console.error(`❌ Error processing user ${userData.email}:`, userError.message)
            }
        }
        
        console.log('✅ Initial users check completed successfully')
    } catch (error) {
        console.error('❌ Error in createInitialUsers:', error)
    }
}

// Alternative version that always recreates the users (use with caution)
export const recreateInitialUsers = async () => {
    try {
        console.log('Recreating initial users (this will delete existing ones)...')
        
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
        
        // Delete and recreate each user
        for (const userData of initialUsers) {
            try {
                // Delete existing user if it exists
                await User.deleteOne({ email: userData.email })
                
                // Create new user
                const user = new User(userData)
                await user.save()
                console.log(`✅ Recreated user: ${userData.email}`)
            } catch (userError) {
                console.error(`❌ Error recreating user ${userData.email}:`, userError.message)
            }
        }
        
        console.log('✅ Initial users recreation completed successfully')
    } catch (error) {
        console.error('❌ Error in recreateInitialUsers:', error)
    }
}

// Call the improved function
createInitialUsers();

// Rest of your existing code...
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

        res.status(201).json({
            message: 'User registered successfully',
            token,
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

        res.json({
            message: 'Login successful',
            token,
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
        const user = await User.findById(req.user.id).select('-password')
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