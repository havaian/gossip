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
                        <button @click="showQRModal = true" class="btn btn-primary">
                            Show QR
                        </button>
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
        
        <!-- QR Code Modal -->
        <div v-if="showQRModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Room Access</h3>
                    <button @click="showQRModal = false" class="text-gray-400 hover:text-gray-500">
                        <span class="sr-only">Close</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="text-center">
                    <qrcode-vue :value="publicRoomUrl" :size="200" level="H" class="mx-auto mb-4" />
                    <p class="text-sm text-gray-600 mb-2">Scan QR code or use link below:</p>
                    <div class="flex items-center justify-center space-x-2">
                        <input type="text" :value="publicRoomUrl" readonly class="input text-sm" />
                        <button @click="copyUrl" class="btn btn-secondary">Copy</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import QrcodeVue from 'qrcode.vue'
import axios from '../services/api'

const route = useRoute()
const authStore = useAuthStore()
const socket = inject('socket')

const room = ref({})
const currentMessage = ref(null)
const showQRModal = ref(false)

const publicRoomUrl = `${window.location.origin}/r/${route.params.id}`

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

const copyUrl = () => {
    navigator.clipboard.writeText(publicRoomUrl)
        .then(() => alert('URL copied to clipboard'))
        .catch(() => alert('Failed to copy URL'))
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