import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isDisplaying: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    ipAddress: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

const Message = mongoose.model('Message', messageSchema)

export default Message