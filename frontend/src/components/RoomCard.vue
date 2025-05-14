<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    room: {
        type: Object,
        required: true
    },
    userRole: {
        type: String,
        default: 'guest'
    }
})
</script>

<template>
    <div
        class="card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition hover:shadow-lg">
        <div class="p-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ room.name }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ room.description }}</p>
                </div>
                <div class="flex items-center">
                    <span class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="room.isActive ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'">
                        {{ room.isActive ? 'Active' : 'Inactive' }}
                    </span>
                </div>
            </div>

            <div class="mt-2">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    <span class="font-medium">Created:</span> {{ new Date(room.createdAt).toLocaleDateString() }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    <span class="font-medium">Messages:</span> {{ room.messageCount || 0 }}
                </p>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
                <!-- Admin actions -->
                <template v-if="userRole === 'admin'">
                    <router-link :to="`/admin/rooms/edit/${room._id}`" class="btn btn-secondary text-xs">
                        Edit
                    </router-link>
                    <button class="btn btn-ghost text-xs">
                        {{ room.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                </template>

                <!-- Moderator actions -->
                <template v-if="userRole === 'moderator'">
                    <router-link :to="`/moderator/moderation/${room._id}`" class="btn btn-primary text-xs">
                        Moderate
                    </router-link>
                    <button class="btn btn-secondary text-xs">
                        {{ room.acceptingMessages ? 'Stop Messages' : 'Accept Messages' }}
                    </button>
                    <button class="btn btn-ghost text-xs">
                        Show QR
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>