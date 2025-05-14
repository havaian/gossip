<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    message: {
        type: Object,
        required: true
    },
    showActions: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['approve', 'reject', 'display'])

function formatTimestamp(timestamp) {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString()
}
</script>

<template>
    <div class="card mb-4 overflow-hidden transform transition-all duration-200" :class="[
        message.status === 'approved' ? 'border-l-4 border-success' :
            message.status === 'rejected' ? 'border-l-4 border-error' :
                message.status === 'pending' ? 'border-l-4 border-warning' : '',
        message.isDisplaying ? 'ring-2 ring-offset-2 ring-primary' : ''
    ]">
        <div class="p-4">
            <div class="flex justify-between items-start">
                <p class="text-gray-900 dark:text-white text-lg">{{ message.content }}</p>
                <span class="text-xs text-gray-500 ml-2">{{ formatTimestamp(message.createdAt) }}</span>
            </div>

            <div class="flex items-center mt-2">
                <span class="px-2 py-1 text-xs rounded-full font-medium" :class="{
                    'bg-success/10 text-success': message.status === 'approved',
                    'bg-error/10 text-error': message.status === 'rejected',
                    'bg-warning/10 text-warning': message.status === 'pending'
                }">
                    {{ message.status.charAt(0).toUpperCase() + message.status.slice(1) }}
                </span>

                <span v-if="message.isDisplaying"
                    class="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    Displaying
                </span>
            </div>

            <div v-if="showActions && message.status === 'pending'" class="mt-3 flex space-x-2">
                <button @click="emit('approve', message._id)" class="btn btn-success text-xs py-1 px-2">
                    Approve
                </button>
                <button @click="emit('reject', message._id)" class="btn btn-error text-xs py-1 px-2">
                    Reject
                </button>
            </div>

            <div v-if="showActions && message.status === 'approved' && !message.isDisplaying" class="mt-3">
                <button @click="emit('display', message._id)" class="btn btn-primary text-xs py-1 px-2">
                    Display
                </button>
            </div>
        </div>
    </div>
</template>