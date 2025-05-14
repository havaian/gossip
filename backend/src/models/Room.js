import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    acceptingMessages: {
        type: Boolean,
        default: true
    },
    currentMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moderator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    presenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

// Virtual for public URL
roomSchema.virtual('publicUrl').get(function () {
    return `/r/${this._id}`
})

const Room = mongoose.model('Room', roomSchema)

export default Room