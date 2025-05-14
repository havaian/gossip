<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '../../services/api'

const route = useRoute()
const toast = useToast()
const roomId = route.params.roomId
const room = ref(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const messageSubmitted = ref(false)
const form = reactive({
    message: ''
})

// Character limit
const MAX_MESSAGE_LENGTH = 200
const remainingChars = ref(MAX_MESSAGE_LENGTH)

// Update remaining characters
function updateRemainingChars() {
    remainingChars.value = MAX_MESSAGE_LENGTH - form.message.length
}

onMounted(async () => {
    await fetchRoomDetails()
})

async function fetchRoomDetails() {
    isLoading.value = true

    try {
        const response = await api.get(`/public/rooms/${roomId}`)
        room.value = response.data
    } catch (error) {
        console.error('Error fetching room details:', error)
        toast.error('This room does not exist or is not available')
    } finally {
        isLoading.value = false
    }
}

async function submitMessage() {
    if (!form.message.trim()) {
        toast.error('Please enter a message')
        return
    }

    if (form.message.length > MAX_MESSAGE_LENGTH) {
        toast.error(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`)
        return
    }

    isSubmitting.value = true

    try {
        await api.post(`/public/rooms/${roomId}/message`, {
            content: form.message
        })

        messageSubmitted.value = true
        toast.success('Message submitted successfully')
        form.message = ''
    } catch (error) {
        console.error('Error submitting message:', error)

        if (error.response?.status === 403) {
            toast.error('This room is not accepting messages at this time')
        } else {
            toast.error('Failed to submit message. Please try again.')
        }
    } finally {
        isSubmitting.value = false
    }
}

function submitAnotherMessage() {
    messageSubmitted.value = false
    form.message = ''
    remainingChars.value = MAX_MESSAGE_LENGTH
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <!-- Header with room name -->
        <header class="bg-primary text-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
                <h1 class="text-3xl font-bold">{{ room?.name || 'Anonymous Room' }}</h1>
                <p class="mt-2">Share your thoughts anonymously</p>
            </div>
        </header>

        <!-- Main content -->
        <main class="flex-grow flex items-center justify-center p-4">
            <!-- Loading state -->
            <div v-if="isLoading" class="flex justify-center items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>

            <!-- Room not available -->
            <div v-else-if="!room || !room.acceptingMessages"
                class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <div class="text-error text-5xl mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {{ room ? 'Not Accepting Messages' : 'Room Not Available' }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400">
                    {{ room ? 'This room is not accepting messages at this time. Please try again later.' : 'The room you are looking for does not exist or is not available.' }}
                </p>
            </div>

            <!-- Submission form -->
            <div v-else-if="!messageSubmitted"
                class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div class="p-6">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Submit Your Message</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                        Your message will be anonymous. Be respectful and follow community guidelines.
                    </p>

                    <form @submit.prevent="submitMessage">
                        <div class="mb-2">
                            <label for="message"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Your Message
                            </label>
                            <textarea id="message" v-model="form.message" @input="updateRemainingChars" rows="4"
                                class="input" :class="{ 'border-error focus:ring-error': remainingChars < 0 }"
                                placeholder="Type your message here..."></textarea>
                        </div>

                        <div class="flex justify-between text-sm mb-4">
                            <span
                                :class="{ 'text-error': remainingChars < 0, 'text-gray-500 dark:text-gray-400': remainingChars >= 0 }">
                                {{ remainingChars }} characters remaining
                            </span>
                        </div>

                        <button type="submit" class="btn btn-primary w-full"
                            :disabled="isSubmitting || !form.message.trim() || remainingChars < 0">
                            <span v-if="isSubmitting"
                                class="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                            <span>{{ isSubmitting ? 'Submitting...' : 'Submit Message' }}</span>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Success message -->
            <div v-else
                class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-fade-in">
                <div class="p-6 text-center">
                    <div class="text-success text-5xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Submitted</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">
                        Your message has been submitted and will be reviewed by the moderator.
                    </p>
                    <button @click="submitAnotherMessage" class="btn btn-primary">
                        Submit Another Message
                    </button>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-white dark:bg-gray-800 shadow-inner py-4">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>All messages are anonymous and subject to moderation</p>
            </div>
        </footer>
    </div>
</template>