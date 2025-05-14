<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const isLoading = ref(true)

onMounted(async () => {
    // Check if user is already logged in
    await authStore.checkAuth()
    isLoading.value = false
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>

        <!-- App content -->
        <div v-else>
            <router-view />
        </div>
    </div>
</template>