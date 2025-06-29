<template>
    <div>
        <!-- Include Navbar -->
        <Navbar />

        <!-- Login Content -->
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                </div>

                <!-- Show token expiry warning if applicable -->
                <div v-if="showExpiryWarning" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div class="flex">
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-yellow-800">Session Expiring Soon</h3>
                            <div class="mt-2 text-sm text-yellow-700">
                                <p>Your session will expire in {{ timeUntilExpiry }} minutes. Please log in again.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
                    <div class="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label for="email" class="sr-only">Email address</label>
                            <input id="email" v-model="email" type="email" required class="input rounded-t-md"
                                placeholder="Email address" :disabled="loading" />
                        </div>
                        <div>
                            <label for="password" class="sr-only">Password</label>
                            <input id="password" v-model="password" type="password" required class="input rounded-b-md"
                                placeholder="Password" :disabled="loading" />
                        </div>
                    </div>

                    <!-- Error message -->
                    <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4">
                        <div class="flex">
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">Login Failed</h3>
                                <div class="mt-2 text-sm text-red-700">
                                    <p>{{ errorMessage }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
                            {{ loading ? 'Signing in...' : 'Sign in' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Navbar from '../components/layout/Navbar.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

// Check if user is coming from an expired session
const showExpiryWarning = computed(() => {
    return authStore.isTokenExpiringSoon() && authStore.isAuthenticated
})

const timeUntilExpiry = computed(() => {
    return authStore.timeUntilExpiry
})

const handleLogin = async () => {
    try {
        loading.value = true
        errorMessage.value = ''

        await authStore.login(email.value, password.value)

        // Redirect to intended page or home
        const redirectTo = router.currentRoute.value.query.redirect || '/'
        router.push(redirectTo)
    } catch (error) {
        errorMessage.value = error
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    // If user is already authenticated and not expiring soon, redirect to home
    if (authStore.isAuthenticated && !showExpiryWarning.value) {
        router.push('/')
    }
})
</script>