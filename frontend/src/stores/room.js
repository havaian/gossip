import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useRoomStore = defineStore('room', {
    state: () => ({
        rooms: [],
        currentRoom: null,
        loading: false,
        error: null
    }),

    actions: {
        async fetchRooms() {
            const authStore = useAuthStore()
            try {
                this.loading = true
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/rooms`, {
                    headers: { Authorization: `Bearer ${authStore.token}` }
                })
                this.rooms = response.data.rooms
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch rooms'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchRoom(roomId) {
            const authStore = useAuthStore()
            try {
                this.loading = true
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/rooms/${roomId}`, {
                    headers: { Authorization: `Bearer ${authStore.token}` }
                })
                this.currentRoom = response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch room'
                throw error
            } finally {
                this.loading = false
            }
        },

        async createRoom(roomData) {
            const authStore = useAuthStore()
            try {
                this.loading = true
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/admin/rooms`,
                    roomData,
                    { headers: { Authorization: `Bearer ${authStore.token}` } }
                )
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
            const authStore = useAuthStore()
            try {
                this.loading = true
                const response = await axios.put(
                    `${import.meta.env.VITE_API_URL}/admin/rooms/${roomId}`,
                    roomData,
                    { headers: { Authorization: `Bearer ${authStore.token}` } }
                )
                const index = this.rooms.findIndex(room => room._id === roomId)
                if (index !== -1) {
                    this.rooms[index] = response.data.room
                }
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
            const authStore = useAuthStore()
            try {
                this.loading = true
                await axios.delete(`${import.meta.env.VITE_API_URL}/admin/rooms/${roomId}`, {
                    headers: { Authorization: `Bearer ${authStore.token}` }
                })
                this.rooms = this.rooms.filter(room => room._id !== roomId)
                if (this.currentRoom?._id === roomId) {
                    this.currentRoom = null
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete room'
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})