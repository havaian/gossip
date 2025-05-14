<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '../../services/api'
import { getSocket, joinRoom, leaveRoom } from '../../services/socket'
import MessageCard from '../../components/MessageCard.vue'
import QRCodeDisplay from '../../components/QRCodeDisplay.vue'

const route = useRoute()
const toast = useToast()
const roomId = route.params.roomId
const room = ref(null)
const messages = ref([])
const pendingMessages = ref([])
const approvedMessages = ref([])
const rejectedMessages = ref([])
const activeTab = ref('pending')
const isLoading = ref(true)
const acceptingMessages = ref(true)
const showQRCode = ref(false)
const socket = getSocket()

// Room submission URL for QR code
const submissionUrl = ref('')

onMounted(async () => {
    // Initialize room and messages
    await fetchRoomDetails()
    await fetchMessages()

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
        acceptingMessages.value = room.value.acceptingMessages
    } catch (error) {
        console.error('Error fetching room details:', error)
        toast.error('Failed to load room details')
    }
}

async function fetchMessages() {
    isLoading.value = true

    try {
        const response = await api.get(`/rooms/${roomId}/messages`)
        messages.value = response.data

        // Filter messages by status
        pendingMessages.value = messages.value.filter(msg => msg.status === 'pending')
        approvedMessages.value = messages.value.filter(msg => msg.status === 'approved')
        rejectedMessages.value = messages.value.filter(msg => msg.status === 'rejected')
    } catch (error) {
        console.error('Error fetching messages:', error)
        toast.error('Failed to load messages')
    } finally {
        isLoading.value = false
    }
}

function setupSocketListeners() {
    if (socket) {
        // New message received
        socket.on('new-message', (message) => {
            messages.value.unshift(message)
            pendingMessages.value.unshift(message)
            toast.info('New message received')
        })

        // Message status updated
        socket.on('message-update', (updatedMessage) => {
            // Update message in all arrays
            const updateMessage = (arr) => {
                const index = arr.findIndex(msg => msg._id === updatedMessage._id)
                if (index !== -1) {
                    arr[index] = updatedMessage
                }
            }

            updateMessage(messages.value)

            // Re-filter messages by status
            pendingMessages.value = messages.value.filter(msg => msg.status === 'pending')
            approvedMessages.value = messages.value.filter(msg => msg.status === 'approved')
            rejectedMessages.value = messages.value.filter(msg => msg.status === 'rejected')
        })
    }
}

function cleanupSocketListeners() {
    if (socket) {
        socket.off('new-message')
        socket.off('message-update')
    }
}

async function approveMessage(messageId) {
    try {
        await api.patch(`/rooms/${roomId}/messages/${messageId}/approve`)
        toast.success('Message approved')
    } catch (error) {
        console.error('Error approving message:', error)
        toast.error('Failed to approve message')
    }
}

async function rejectMessage(messageId) {
    try {
        await api.patch(`/rooms/${roomId}/messages/${messageId}/reject`)
        toast.success('Message rejected')
    } catch (error) {
        console.error('Error rejecting message:', error)
        toast.error('Failed to reject message')
    }
}

async function displayMessage(messageId) {
    try {
        await api.patch(`/rooms/${roomId}/messages/${messageId}/display`)
        toast.success('Message is now displaying')
    } catch (error) {
        console.error('Error displaying message:', error)
        toast.error('Failed to display message')
    }
}

async function toggleAcceptingMessages() {
    try {
        const newStatus = !acceptingMessages.value
        await api.patch(`/rooms/${roomId}/toggle-accepting`, {
            acceptingMessages: newStatus
        })
        acceptingMessages.value = newStatus
        toast.success(`Message submission ${newStatus ? 'enabled' : 'disabled'}`)
    } catch (error) {
        console.error('Error toggling message acceptance:', error)
        toast.error('Failed to update message acceptance status')
    }
}

async function clearAllMessages() {
    if (!confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
        return
    }

    try {
        await api.delete(`/rooms/${roomId}/messages`)
        messages.value = []
        pendingMessages.value = []
        approvedMessages.value = []
        rejectedMessages.value = []
        toast.success('All messages cleared')
    } catch (error) {
        console.error('Error clearing messages:', error)
        toast.error('Failed to clear messages')
    }
}

function toggleQRCode() {
    showQRCode.value = !showQRCode.value
}
</script>

<template>
    <div>
        <!-- Room info and actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ room?.name || 'Room Moderation' }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                    {{ room?.description || 'Manage messages in this room' }}
                </p>
            </div>

            <div class="flex flex-wrap gap-2 mt-4 md:mt-0">
                <button @click="toggleAcceptingMessages" class="btn"
                    :class="acceptingMessages ? 'btn-error' : 'btn-success'">
                    {{ acceptingMessages ? 'Stop Receiving' : 'Start Receiving' }}
                </button>
                <button @click="toggleQRCode" class="btn btn-secondary">
                    {{ showQRCode ? 'Hide QR Code' : 'Show QR Code' }}
                </button>
                <button @click="clearAllMessages" class="btn btn-ghost">
                    Clear All Messages
                </button>
            </div>
        </div>

        <!-- QR Code display -->
        <div v-if="showQRCode" class="mb-6 animate-fade-in">
            <QRCodeDisplay :url="submissionUrl" :roomName="room?.name || 'Anonymous Room'" :size="200" />
        </div>

        <!-- Message status indicator -->
        <div class="bg-white dark:bg-gray-800 p-4 mb-6 rounded-lg shadow-sm flex items-center justify-between">
            <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" :class="acceptingMessages ? 'bg-success' : 'bg-error'"></div>
                <span class="text-gray-700 dark:text-gray-300">
                    {{ acceptingMessages ? 'Accepting new messages' : 'Not accepting messages' }}
                </span>
            </div>
            <div>
                <span class="text-gray-600 dark:text-gray-400">Total messages: {{ messages.length }}</span>
            </div>
        </div>

        <!-- Message tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav class="flex -mb-px">
                <button @click="activeTab = 'pending'"
                    class="py-4 px-6 font-medium text-sm border-b-2 focus:outline-none"
                    :class="activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'">
                    Pending
                    <span class="ml-2 bg-warning/10 text-warning px-2 py-0.5 rounded-full text-xs">
                        {{ pendingMessages.length }}
                    </span>
                </button>

                <button @click="activeTab = 'approved'"
                    class="py-4 px-6 font-medium text-sm border-b-2 focus:outline-none"
                    :class="activeTab === 'approved' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'">
                    Approved
                    <span class="ml-2 bg-success/10 text-success px-2 py-0.5 rounded-full text-xs">
                        {{ approvedMessages.length }}
                    </span>
                </button>

                <button @click="activeTab = 'rejected'"
                    class="py-4 px-6 font-medium text-sm border-b-2 focus:outline-none"
                    :class="activeTab === 'rejected' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'">
                    Rejected
                    <span class="ml-2 bg-error/10 text-error px-2 py-0.5 rounded-full text-xs">
                        {{ rejectedMessages.length }}
                    </span>
                </button>
            </nav>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center my-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>

        <!-- Message list -->
        <div v-else>
            <!-- Pending messages -->
            <div v-if="activeTab === 'pending'">
                <div v-if="pendingMessages.length === 0" class="text-center py-12">
                    <p class="text-gray-500 dark:text-gray-400">No pending messages</p>
                </div>

                <div v-else>
                    <MessageCard v-for="message in pendingMessages" :key="message._id" :message="message"
                        @approve="approveMessage" @reject="rejectMessage" />
                </div>
            </div>

            <!-- Approved messages -->
            <div v-if="activeTab === 'approved'">
                <div v-if="approvedMessages.length === 0" class="text-center py-12">
                    <p class="text-gray-500 dark:text-gray-400">No approved messages</p>
                </div>

                <div v-else>
                    <MessageCard v-for="message in approvedMessages" :key="message._id" :message="message"
                        @display="displayMessage" />
                </div>
            </div>

            <!-- Rejected messages -->
            <div v-if="activeTab === 'rejected'">
                <div v-if="rejectedMessages.length === 0" class="text-center py-12">
                    <p class="text-gray-500 dark:text-gray-400">No rejected messages</p>
                </div>

                <div v-else>
                    <MessageCard v-for="message in rejectedMessages" :key="message._id" :message="message"
                        :showActions="false" />
                </div>
            </div>
        </div>
    </div>
</template>