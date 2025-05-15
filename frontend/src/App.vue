<template>
    <div class="min-h-screen bg-gray-50">
        <router-view></router-view>
    </div>
</template>

<script setup>
import { onMounted, inject } from 'vue'
import { useAuthStore } from './stores/auth'

const socket = inject('socket')
const authStore = useAuthStore()

onMounted(() => {
    // Connect socket if user is authenticated
    if (authStore.isAuthenticated) {
        socket.auth = { token: authStore.token }
        socket.connect()
    }
})
</script>