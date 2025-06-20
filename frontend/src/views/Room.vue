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
                        <button @click="toggleAcceptingMessages" class="btn"
                            :class="room.acceptingMessages ? 'btn-primary' : 'btn-secondary'">
                            {{ room.acceptingMessages ? 'Stop Accepting' : 'Start Accepting' }}
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Messages List -->
                <div class="lg:col-span-2 bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Messages</h2>
                    <div class="space-y-4 max-h-[600px] overflow-y-auto">
                        <div v-for="message in messages" :key="message._id" class="p-4 border rounded-lg" :class="{
                            'border-gray-200': message.status === 'pending',
                            'border-green-200 bg-green-50': message.status === 'approved',
                            'border-red-200 bg-red-50': message.status === 'rejected'
                        }">
                            <p class="text-gray-900">{{ message.content }}</p>
                            <div class="mt-2 flex justify-between items-center">
                                <span class="text-sm text-gray-500">{{ new Date(message.createdAt).toLocaleString() }}</span>
                                <div class="space-x-2" v-if="message.status === 'pending'">
                                    <button @click="approveMessage(message._id)"
                                        class="btn btn-primary">Approve</button>
                                    <button @click="rejectMessage(message._id)"
                                        class="btn bg-red-600 text-white hover:bg-red-700">Reject</button>
                                </div>
                                <button v-if="message.status === 'approved'" @click="displayMessage(message._id)"
                                    class="btn btn-primary" :disabled="message.isDisplaying">
                                    {{ message.isDisplaying ? 'Currently Displaying' : 'Display' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Current Display -->
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Currently Displaying</h2>
                    <div v-if="currentMessage" class="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <p class="text-gray-900">{{ currentMessage.content }}</p>
                        <p class="mt-2 text-sm text-gray-500">
                            Displayed at: {{ new Date(currentMessage.approvedAt).toLocaleString() }}
                        </p>
                    </div>
                    <div v-else class="text-center py-8 text-gray-500">
                        No message is currently being displayed
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from '../services/api'

const route = useRoute()
const authStore = useAuthStore()
const socket = inject('socket')

const room = ref({})
const messages = ref([])
const currentMessage = ref(null)

// Fetch room details
const fetchRoom = async () => {
    try {
        const response = await axios.get(`/rooms/${route.params.id}`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        room.value = response.data
    } catch (error) {
        console.error('Error fetching room:', error)
    }
}

// Fetch messages
const fetchMessages = async () => {
    try {
        const response = await axios.get(`/rooms/${route.params.id}/messages`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        messages.value = response.data
    } catch (error) {
        console.error('Error fetching messages:', error)
    }
}

// Fetch current message
const fetchCurrentMessage = async () => {
    try {
        const response = await axios.get(`/rooms/${route.params.id}/current-message`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        currentMessage.value = response.data
    } catch (error) {
        console.error('Error fetching current message:', error)
    }
}

// Message actions
const approveMessage = async (messageId) => {
    try {
        await axios.patch(
            `/rooms/${route.params.id}/messages/${messageId}/approve`,
            {},
            { headers: { Authorization: `Bearer ${authStore.token}` } }
        )
        await fetchMessages()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to approve message')
    }
}

const rejectMessage = async (messageId) => {
    try {
        await axios.patch(
            `/rooms/${route.params.id}/messages/${messageId}/reject`,
            {},
            { headers: { Authorization: `Bearer ${authStore.token}` } }
        )
        await fetchMessages()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject message')
    }
}

const displayMessage = async (messageId) => {
    try {
        await axios.patch(
            `/rooms/${route.params.id}/messages/${messageId}/display`,
            {},
            { headers: { Authorization: `Bearer ${authStore.token}` } }
        )
        await fetchCurrentMessage()
        await fetchMessages()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to display message')
    }
}

const toggleAcceptingMessages = async () => {
    try {
        await axios.patch(
            `/rooms/${route.params.id}/toggle-accepting`,
            { acceptingMessages: !room.value.acceptingMessages },
            { headers: { Authorization: `Bearer ${authStore.token}` } }
        )
        await fetchRoom()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to toggle accepting messages')
    }
}

// Socket events
socket.on('new-message', () => {
    fetchMessages()
})

socket.on('message-update', () => {
    fetchMessages()
    fetchCurrentMessage()
})

socket.on('display-message', () => {
    fetchCurrentMessage()
})

socket.on('room-update', (updatedRoom) => {
    room.value = updatedRoom
})

onMounted(() => {
    socket.emit('join-room', { roomId: route.params.id })
    fetchRoom()
    fetchMessages()
    fetchCurrentMessage()
})
</script>