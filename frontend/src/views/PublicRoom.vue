<template>
    <div>
        <!-- Simple header for public room -->
        <nav class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <!-- Logo and Title -->
                        <a href='https://bolt.new/' target="_blank" rel="noopener noreferrer" class="flex items-center space-x-3">
                            <img src="/logo.png" alt="Gossip MUN Logo" class="w-24 h-24" />
                            <div class="flex flex-col">
                                <h1 class="text-xl font-bold text-gray-900">Gossip MUN</h1>
                                <a href="/" class="text-sm text-gray-600 hover:text-gray-900">
                                    gossip.ytech.space
                                </a>
                            </div>
                        </a>
                    </div>
                    <div class="flex items-center">
                        <span class="text-gray-700">{{ room.name }}</span>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">{{ room.name }}</h1>
                    <p class="mt-2 text-gray-600">{{ room.description }}</p>
                </div>

                <div v-if="room.acceptingMessages" class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Submit Your Message</h2>
                    <form @submit.prevent="submitMessage">
                        <div class="mb-4">
                            <label for="message" class="sr-only">Your message</label>
                            <textarea id="message" v-model="message" rows="4" class="input"
                                placeholder="Type your message here..." required maxlength="500"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary w-full" :disabled="submitting">
                            {{ submitting ? 'Submitting...' : 'Submit Message' }}
                        </button>
                    </form>
                </div>
                <div v-else class="bg-white shadow rounded-lg p-6 text-center">
                    <p class="text-gray-600">This room is not accepting messages at this time.</p>
                </div>

                <div v-if="currentMessage" class="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Currently Displaying</h2>
                    <p class="text-gray-900">{{ currentMessage.content }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import axios from '../services/api'

const route = useRoute()
const socket = inject('socket')

const room = ref({})
const currentMessage = ref(null)
const message = ref('')
const submitting = ref(false)

const fetchRoom = async () => {
    try {
        const response = await axios.get(`/public/rooms/${route.params.id}`)
        room.value = response.data
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to load room')
    }
}

const submitMessage = async () => {
    try {
        submitting.value = true
        await axios.post(`/public/rooms/${route.params.id}/message`, {
            content: message.value
        })
        message.value = ''
        alert('Message submitted successfully')
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to submit message')
    } finally {
        submitting.value = false
    }
}

// Socket events
socket.on('display-message', (message) => {
    currentMessage.value = message
})

socket.on('room-update', (updatedRoom) => {
    room.value = updatedRoom
})

onMounted(() => {
    socket.connect()
    socket.emit('join-room', { roomId: route.params.id })
    fetchRoom()
})
</script>