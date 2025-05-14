<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import RoomCard from '../../components/RoomCard.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const rooms = ref([])
const users = ref([])
const stats = ref({
    totalRooms: 0,
    activeRooms: 0,
    totalUsers: 0,
    totalMessages: 0
})
const isLoading = ref(true)

onMounted(async () => {
    await fetchDashboardData()
})

async function fetchDashboardData() {
    isLoading.value = true
    try {
        // Get stats, recent rooms and users
        const [statsResponse, roomsResponse, usersResponse] = await Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/rooms?limit=5'),
            api.get('/admin/users?limit=5')
        ])

        stats.value = statsResponse.data
        rooms.value = roomsResponse.data
        users.value = usersResponse.data
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
    } finally {
        isLoading.value = false
    }
}

function createNewRoom() {
    router.push('/admin/rooms/create')
}
</script>

<template>
    <div>
        <!-- Dashboard header -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400">Monitor and manage your anonymous messaging system</p>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center my-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>

        <!-- Dashboard content -->
        <div v-else>
            <!-- Stats overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="card p-4">
                    <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">Total Rooms</h3>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.totalRooms }}</p>
                </div>

                <div class="card p-4">
                    <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">Active Rooms</h3>
                    <p class="text-3xl font-bold text-success mt-1">{{ stats.activeRooms }}</p>
                </div>

                <div class="card p-4">
                    <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.totalUsers }}</p>
                </div>

                <div class="card p-4">
                    <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">Total Messages</h3>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.totalMessages }}</p>
                </div>
            </div>

            <!-- Recent rooms -->
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Recent Rooms</h2>
                    <button @click="createNewRoom" class="btn btn-primary">
                        Create Room
                    </button>
                </div>

                <div v-if="rooms.length === 0" class="text-center py-8">
                    <p class="text-gray-500 dark:text-gray-400">No rooms available</p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RoomCard v-for="room in rooms" :key="room._id" :room="room" userRole="admin" />
                </div>

                <div class="mt-4 text-right">
                    <router-link to="/admin/rooms" class="text-primary hover:text-primary-dark">
                        View all rooms →
                    </router-link>
                </div>
            </div>

            <!-- Recent users -->
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Recent Users</h2>
                    <router-link to="/admin/users/create" class="btn btn-primary">
                        Create User
                    </router-link>
                </div>

                <div v-if="users.length === 0" class="text-center py-8">
                    <p class="text-gray-500 dark:text-gray-400">No users available</p>
                </div>

                <div v-else class="card overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Name</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Email</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Role</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                <tr v-for="user in users" :key="user._id">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded-full font-medium" :class="{
                                            'bg-primary/10 text-primary': user.role === 'admin',
                                            'bg-secondary/10 text-secondary': user.role === 'moderator',
                                            'bg-accent/10 text-accent': user.role === 'presenter'
                                        }">
                                            {{ user.role }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded-full font-medium"
                                            :class="user.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'">
                                            {{ user.isActive ? 'Active' : 'Inactive' }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="mt-4 text-right">
                    <router-link to="/admin/users" class="text-primary hover:text-primary-dark">
                        View all users →
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>