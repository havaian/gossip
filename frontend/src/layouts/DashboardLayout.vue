<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

// User-related computed properties
const user = computed(() => authStore.user)
const userRole = computed(() => user.value?.role || '')
const userInitials = computed(() => {
    if (!user.value?.name) return 'U'
    return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

// Navigation menus based on user role
const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: 'HomeIcon' },
    { name: 'Rooms', path: '/admin/rooms', icon: 'RoomIcon' },
    { name: 'Users', path: '/admin/users', icon: 'UsersIcon' }
]

const moderatorNavItems = [
    { name: 'Dashboard', path: '/moderator', icon: 'HomeIcon' },
    // Moderation page is dynamic based on the room
]

const navItems = computed(() => {
    if (userRole.value === 'admin') return adminNavItems
    if (userRole.value === 'moderator') return moderatorNavItems
    return []
})

// Logout function
async function logout() {
    await authStore.logout()
    router.push('/login')
}

// Toggle mobile menu
function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Sidebar for desktop -->
        <aside class="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
            <div class="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-5 pb-4 overflow-y-auto">
                <div class="flex items-center flex-shrink-0 px-4">
                    <h1 class="text-xl font-bold text-primary">Anonymous</h1>
                </div>
                <div class="mt-5 flex-1 flex flex-col">
                    <nav class="flex-1 px-4 space-y-1">
                        <router-link v-for="item in navItems" :key="item.name" :to="item.path"
                            class="group flex items-center px-3 py-2 text-base font-medium rounded-md"
                            :class="[$route.path.startsWith(item.path) ? 'bg-primary-light/10 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700']">
                            <span>{{ item.name }}</span>
                        </router-link>
                    </nav>
                </div>
                <div class="p-4">
                    <button @click="logout" class="w-full btn btn-ghost text-left">
                        Logout
                    </button>
                </div>
            </div>
        </aside>

        <!-- Main content -->
        <div class="md:pl-64 flex flex-col min-h-screen">
            <!-- Mobile header -->
            <header class="bg-white dark:bg-gray-800 shadow md:hidden">
                <div class="px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 class="text-lg font-bold text-primary">Anonymous</h1>
                    </div>
                    <button @click="toggleMobileMenu"
                        class="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                        <span class="sr-only">Open main menu</span>
                        <!-- Menu icon -->
                        <svg v-if="!isMobileMenuOpen" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <!-- Close icon -->
                        <svg v-else class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Mobile menu -->
                <div v-if="isMobileMenuOpen" class="px-2 pb-3 space-y-1 sm:px-3 animate-fade-in">
                    <router-link v-for="item in navItems" :key="item.name" :to="item.path"
                        @click="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium"
                        :class="[$route.path.startsWith(item.path) ? 'bg-primary-light/10 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700']">
                        {{ item.name }}
                    </router-link>
                    <button @click="logout"
                        class="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                        Logout
                    </button>
                </div>
            </header>

            <!-- Desktop header -->
            <header class="hidden md:flex bg-white dark:bg-gray-800 shadow">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex items-center justify-between">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                        {{ $route.name }}
                    </h1>
                    <div class="flex items-center">
                        <div class="ml-3 relative">
                            <div>
                                <button
                                    class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                    <span
                                        class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white">
                                        {{ userInitials }}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page content -->
            <main class="flex-1 py-6">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <router-view />
                </div>
            </main>
        </div>
    </div>
</template>