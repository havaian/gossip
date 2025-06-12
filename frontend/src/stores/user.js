import { defineStore } from 'pinia'
import axios from '../services/api'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchUsers() {
            const authStore = useAuthStore()
            try {
                this.loading = true
                const response = await axios.get(`/admin/users`, {
                    headers: { Authorization: `Bearer ${authStore.token}` }
                })
                this.users = response.data.users
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch users'
                throw error
            } finally {
                this.loading = false
            }
        },

        async createUser(userData) {
            const authStore = useAuthStore()
            try {
                this.loading = true
                const response = await axios.post(`/admin/users`,
                    userData,
                    { headers: { Authorization: `Bearer ${authStore.token}` } }
                )
                this.users.push(response.data.user)
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to create user'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateUser(userId, userData) {
            const authStore = useAuthStore()
            try {
                this.loading = true
                const response = await axios.put(`/admin/users/${userId}`,
                    userData,
                    { headers: { Authorization: `Bearer ${authStore.token}` } }
                )
                const index = this.users.findIndex(user => user._id === userId)
                if (index !== -1) {
                    this.users[index] = response.data.user
                }
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to update user'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteUser(userId) {
            const authStore = useAuthStore()
            try {
                this.loading = true
                await axios.delete(`/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${authStore.token}` }
                })
                this.users = this.users.filter(user => user._id !== userId)
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete user'
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})