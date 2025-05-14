<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import { getSocket, joinRoom, leaveRoom } from '../../services/socket'
import QRCodeDisplay from '../../components/QRCodeDisplay.vue'

const route = useRoute()
const authStore = useAuthStore()
const roomId = route.params.roomId
const room = ref(null)
const currentMessage = ref(null)
const isLoading = ref(true)
const showQRCode = ref(true)
const socket = getSocket()

// Room submission URL for QR code
const submissionUrl = ref('')

onMounted(async () => {
    // Initialize room and current displayed message
    await fetchRoomDetails()
    await fetchCurrentMessage()

    // Join room socket
    joinRoom(roomId)

    // Setup socket listeners
    setupSocketListeners()

    // Generate submission URL
    const baseUrl = window.location.origin
    submissionUrl.value = `${baseUrl}/r/${roomId}`
})

onBeforeUnmount(() => {
    // Leave room socket
    leaveRoom(roomId)

    // Cleanup socket listeners
    cleanupSocketListeners()
})

async function fetchRoomDetails() {
    try {
        const response = await api.get(`/rooms/${roomId}`)
        room.value = response.data
    } catch (error) {
        console.error('Error fetching room details:', error)
    }
}

async function fetchCurrentMessage() {
    isLoading.value = true

    try {
        const response = await api.get(`/rooms/${roomId}/current-message`)
        if (response.data) {
            currentMessage.value = response.data
        }
    } catch (error) {
        console.error('Error fetching current message:', error)
    } finally {
        isLoading.value = false
    }
}

function setupSocketListeners() {
    if (socket) {
        // Message display changed
        socket.on('display-message', (message) => {
            currentMessage.value = message
        })

        // Room status changed
        socket.on('room-update', (updatedRoom) => {
            if (updatedRoom._id === roomId) {
                room.value = updatedRoom
            }
        })
    }
}

function cleanupSocketListeners() {
    if (socket) {
        socket.off('display-message')
        socket.off('room-update')
    }
}

function toggleQRCode() {
    showQRCode.value = !showQRCode.value
}
</script>

<template>
    <div class="h-screen bg-gray-900 flex flex-col">
        <!-- Header with room name and controls -->
        <header class="bg-gray-800 shadow p-4">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <h1 class="text-2xl font-bold text-white">{{ room?.name || 'Anonymous Room' }}</h1>

                <div class="flex items-center space-x-4">
                    <button @click="toggleQRCode" class="btn btn-secondary">
                        {{ showQRCode ? 'Hide QR Code' : 'Show QR Code' }}
                    </button>
                </div>
            </div>
        </header>

        <!-- Main display area -->
        <main class="flex-grow flex overflow-hidden">
            <div class="w-full p-4 lg:p-8 flex flex-col md:flex-row items-center justify-center">
                <!-- QR Code area (hidden or shown) -->
                <div v-if="showQRCode" class="w-full md:w-1/3 p-4 animate-fade-in flex-shrink-0">
                    <QRCodeDisplay :url="submissionUrl" :roomName="room?.name || 'Anonymous Room'" :size="300" />
                </div>

                <!-- Message display area -->
                <div class="w-full flex-grow flex items-center justify-center p-4">
                    <!-- Loading -->
                    <div v-if="isLoading" class="flex justify-center items-center">
                        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                    </div>

                    <!-- No message -->
                    <div v-else-if="!currentMessage"
                        class="text-center p-8 bg-gray-800 rounded-lg max-w-2xl w-full animate-fade-in">
                        <p class="text-xl text-gray-300">No message is currently being displayed</p>
                        <p class="text-gray-400 mt-4">Messages approved by the moderator will appear here</p>
                    </div>

                    <!-- Message displayed -->
                    <div v-else
                        class="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full animate-fade-in">
                        <p class="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                            {{ currentMessage.content }}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>