<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <router-link to="/" class="flex-shrink-0 flex items-center">
                            <h1 class="text-xl font-bold text-gray-900">Gossip MUN</h1>
                        </router-link>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-700">{{ room.name }}</span>
                        <router-link to="/" class="btn btn-secondary">
                            Back to Home
                        </router-link>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content - Full Screen Message Display -->
        <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            <h2 class="text-2xl font-semibold mb-6 text-center">Currently Displaying</h2>

            <div v-if="currentMessage"
                class="w-full max-w-4xl mx-auto p-8 border-2 border-blue-300 bg-blue-50 rounded-lg shadow-lg">
                <p class="text-3xl font-medium text-center text-gray-900 mb-8">{{ currentMessage.content }}</p>
                <p class="mt-6 text-sm text-gray-500 text-center">
                    Displayed at: {{ new Date(currentMessage.approvedAt).toLocaleString() }}
                </p>
            </div>

            <div v-else
                class="w-full max-w-4xl mx-auto p-16 border-2 border-gray-300 bg-gray-50 rounded-lg text-center shadow-md">
                <p class="text-2xl text-gray-500">No message is currently being displayed</p>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const route = useRoute()
const authStore = useAuthStore()
const socket = inject('socket')

const room = ref({})
const currentMessage = ref(null)

// Fetch room details
const fetchRoom = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/rooms/${route.params.id}`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        room.value = response.data
    } catch (error) {
        console.error('Error fetching room:', error)
    }
}

// Fetch current message
const fetchCurrentMessage = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/rooms/${route.params.id}/current-message`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        currentMessage.value = response.data
    } catch (error) {
        console.error('Error fetching current message:', error)
    }
}

// Socket events
socket.on('display-message', () => {
    fetchCurrentMessage()
})

socket.on('room-update', (updatedRoom) => {
    room.value = updatedRoom
})

onMounted(() => {
    socket.emit('join-room', { roomId: route.params.id })
    fetchRoom()
    fetchCurrentMessage()
})
</script>