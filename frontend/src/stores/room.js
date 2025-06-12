// frontend/src/stores/room.js
import { defineStore } from 'pinia'
import { apiService } from '../services/api'

export const useRoomStore = defineStore('room', {
    state: () => ({
        rooms: [],
        currentRoom: null,
        currentMessage: null,
        messages: [],
        loading: false,
        error: null
    }),

    getters: {
        pendingMessages: (state) => state.messages.filter(msg => msg.status === 'pending'),
        approvedMessages: (state) => state.messages.filter(msg => msg.status === 'approved'),
        rejectedMessages: (state) => state.messages.filter(msg => msg.status === 'rejected'),
        displayingMessage: (state) => state.messages.find(msg => msg.isDisplaying)
    },

    actions: {
        async fetchRooms() {
            try {
                this.loading = true
                this.error = null
                const response = await apiService.rooms.getRooms()
                this.rooms = response.data.rooms
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch rooms'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchRoom(roomId) {
            try {
                this.loading = true
                this.error = null
                const response = await apiService.rooms.getRoomDetails(roomId)
                this.currentRoom = response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch room'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchRoomMessages(roomId, params = {}) {
            try {
                this.loading = true
                this.error = null
                const response = await apiService.rooms.getRoomMessages(roomId, params)
                this.messages = response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch messages'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchCurrentMessage(roomId) {
            try {
                this.error = null
                const response = await apiService.rooms.getCurrentMessage(roomId)
                this.currentMessage = response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch current message'
                throw error
            }
        },

        async createRoom(roomData) {
            try {
                this.loading = true
                this.error = null
                const response = await apiService.admin.createRoom(roomData)
                this.rooms.push(response.data.room)
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to create room'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateRoom(roomId, roomData) {
            try {
                this.loading = true
                this.error = null
                const response = await apiService.admin.updateRoom(roomId, roomData)

                // Update in rooms array
                const index = this.rooms.findIndex(room => room._id === roomId)
                if (index !== -1) {
                    this.rooms[index] = response.data.room
                }

                // Update current room if it matches
                if (this.currentRoom?._id === roomId) {
                    this.currentRoom = response.data.room
                }

                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to update room'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteRoom(roomId) {
            try {
                this.loading = true
                this.error = null
                await apiService.admin.deleteRoom(roomId)

                // Remove from rooms array
                this.rooms = this.rooms.filter(room => room._id !== roomId)

                // Clear current room if it was deleted
                if (this.currentRoom?._id === roomId) {
                    this.currentRoom = null
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete room'
                throw error
            } finally {
                this.loading = false
            }
        },

        async approveMessage(roomId, messageId) {
            try {
                this.error = null
                const response = await apiService.rooms.approveMessage(roomId, messageId)

                // Update message in array
                const index = this.messages.findIndex(msg => msg._id === messageId)
                if (index !== -1) {
                    this.messages[index] = response.data.data
                }

                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to approve message'
                throw error
            }
        },

        async rejectMessage(roomId, messageId) {
            try {
                this.error = null
                const response = await apiService.rooms.rejectMessage(roomId, messageId)

                // Update message in array
                const index = this.messages.findIndex(msg => msg._id === messageId)
                if (index !== -1) {
                    this.messages[index] = response.data.data
                }

                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to reject message'
                throw error
            }
        },

        async displayMessage(roomId, messageId) {
            try {
                this.error = null
                const response = await apiService.rooms.displayMessage(roomId, messageId)

                // Update messages array
                this.messages = this.messages.map(msg => ({
                    ...msg,
                    isDisplaying: msg._id === messageId
                }))

                // Update current message
                this.currentMessage = response.data.data

                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to display message'
                throw error
            }
        },

        async toggleAcceptingMessages(roomId, acceptingMessages) {
            try {
                this.error = null
                const response = await apiService.rooms.toggleAcceptingMessages(roomId, acceptingMessages)

                // Update current room
                if (this.currentRoom?._id === roomId) {
                    this.currentRoom.acceptingMessages = acceptingMessages
                }

                // Update in rooms array
                const index = this.rooms.findIndex(room => room._id === roomId)
                if (index !== -1) {
                    this.rooms[index].acceptingMessages = acceptingMessages
                }

                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to toggle accepting messages'
                throw error
            }
        },

        async clearAllMessages(roomId) {
            try {
                this.loading = true
                this.error = null
                await apiService.rooms.clearAllMessages(roomId)

                // Clear messages array
                this.messages = []
                this.currentMessage = null

                // Update current room
                if (this.currentRoom?._id === roomId) {
                    this.currentRoom.currentMessage = null
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to clear messages'
                throw error
            } finally {
                this.loading = false
            }
        },

        // Socket event handlers
        handleNewMessage(message) {
            // Add new message to the beginning of the array
            this.messages.unshift(message)
        },

        handleMessageUpdate(updatedMessage) {
            const index = this.messages.findIndex(msg => msg._id === updatedMessage._id)
            if (index !== -1) {
                this.messages[index] = updatedMessage
            }
        },

        handleDisplayMessage(message) {
            // Update current message
            this.currentMessage = message

            // Update all messages to show only this one is displaying
            this.messages = this.messages.map(msg => ({
                ...msg,
                isDisplaying: msg._id === message._id
            }))
        },

        handleRoomUpdate(updatedRoom) {
            // Update current room
            if (this.currentRoom?._id === updatedRoom._id) {
                this.currentRoom = updatedRoom
            }

            // Update in rooms array
            const index = this.rooms.findIndex(room => room._id === updatedRoom._id)
            if (index !== -1) {
                this.rooms[index] = updatedRoom
            }
        },

        handleMessagesCleared(data) {
            if (this.currentRoom?._id === data.roomId) {
                this.messages = []
                this.currentMessage = null
            }
        },

        // Clear store state
        clearStore() {
            this.rooms = []
            this.currentRoom = null
            this.currentMessage = null
            this.messages = []
            this.loading = false
            this.error = null
        }
    }
})