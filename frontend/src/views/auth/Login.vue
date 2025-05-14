<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)
const form = reactive({
    email: '',
    password: ''
})

async function handleLogin() {
    if (!form.email || !form.password) {
        return
    }

    isLoading.value = true

    try {
        const success = await authStore.login({
            email: form.email,
            password: form.password
        })

        if (success) {
            // Redirect based on user role
            const userRole = authStore.user.role

            if (userRole === 'admin') {
                router.push('/admin')
            } else if (userRole === 'moderator') {
                router.push('/moderator')
            } else if (userRole === 'presenter') {
                // Presenter should have an assigned room
                const roomId = authStore.user.assignedRoom
                if (roomId) {
                    router.push(`/presenter/${roomId}`)
                } else {
                    router.push('/login')
                }
            }
        }
    } catch (error) {
        console.error('Login error:', error)
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="card animate-fade-in">
        <div class="p-6">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Sign in</h2>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                    Sign in to your account to continue
                </p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label for="email" class="label">Email address</label>
                    <input id="email" v-model="form.email" type="email" required autocomplete="email" class="input"
                        placeholder="your@email.com" />
                </div>

                <div>
                    <label for="password" class="label">Password</label>
                    <input id="password" v-model="form.password" type="password" required
                        autocomplete="current-password" class="input" placeholder="••••••••" />
                </div>

                <div>
                    <button type="submit" class="btn btn-primary w-full" :disabled="isLoading">
                        <span v-if="isLoading"
                            class="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                        <span>{{ isLoading ? 'Signing in...' : 'Sign in' }}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>