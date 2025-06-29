<template>
    <div class="min-h-screen bg-gray-50">
        <nav class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <a href='https://bolt.new/' target="_blank" rel="noopener noreferrer">
                                <h1 class="text-xl font-bold text-gray-900">Gossip MUN</h1>
                            </a>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <span class="text-gray-700 mr-4">{{ authStore.user.name }}</span>
                        <button @click="handleLogout" class="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Admin Dashboard -->
        <main v-if="authStore.isAdmin" class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div class="border-4 border-dashed border-gray-200 rounded-lg p-4">
                    <h2 class="text-2xl font-bold mb-4">Rooms</h2>
                    <button @click="showCreateRoomModal = true" class="btn btn-primary mb-4">
                        Create New Room
                    </button>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div v-for="room in rooms" :key="room._id" class="bg-white shadow rounded-lg p-4">
                            <h3 class="text-lg font-semibold">{{ room.name }}</h3>
                            <p class="text-gray-600">{{ room.description }}</p>
                            <div class="mt-4 flex justify-between">
                                <router-link :to="'/room/' + room._id" class="btn btn-primary">
                                    Manage
                                </router-link>
                                <button @click="deleteRoom(room._id)"
                                    class="btn bg-red-600 text-white hover:bg-red-700">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Moderator View -->
        <main v-else-if="authStore.isModerator" class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <h2 class="text-2xl font-bold mb-4">Available Rooms</h2>

                <div v-if="rooms.length > 0" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div v-for="room in rooms" :key="room._id" class="bg-white shadow rounded-lg p-4">
                        <h3 class="text-lg font-semibold">{{ room.name }}</h3>
                        <p class="text-gray-600">{{ room.description }}</p>
                        <div class="mt-4">
                            <router-link :to="'/room/' + room._id" class="btn btn-primary">
                                Moderate Room
                            </router-link>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-12">
                    <h3 class="text-xl text-gray-600">No rooms are available.</h3>
                </div>
            </div>
        </main>

        <!-- Presenter View -->
        <main v-else-if="authStore.isPresenter" class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <h2 class="text-2xl font-bold mb-4">Available Rooms</h2>

                <div v-if="rooms.length > 0" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div v-for="room in rooms" :key="room._id" class="bg-white shadow rounded-lg p-4">
                        <h3 class="text-lg font-semibold">{{ room.name }}</h3>
                        <p class="text-gray-600">{{ room.description }}</p>
                        <div class="mt-4">
                            <router-link :to="'/presenter/room/' + room._id" class="btn btn-primary">
                                View Presentation
                            </router-link>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-12">
                    <h3 class="text-xl text-gray-600">No rooms are available.</h3>
                </div>
            </div>
        </main>

        <!-- Create Room Modal -->
        <div v-if="showCreateRoomModal"
            class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 class="text-lg font-semibold mb-4">Create New Room</h3>
                <form @submit.prevent="createRoom">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Room Name</label>
                        <input v-model="newRoom.name" type="text" class="input" required />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Description</label>
                        <textarea v-model="newRoom.description" class="input" rows="3"></textarea>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" @click="showCreateRoomModal = false" class="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="creating">
                            {{ creating ? 'Creating...' : 'Create Room' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import axios from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const rooms = ref([])
const showCreateRoomModal = ref(false)
const creating = ref(false)
const newRoom = ref({
    name: '',
    description: ''
})

const fetchRooms = async () => {
    try {
        const response = await axios.get(`/admin/rooms`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        rooms.value = response.data.rooms
    } catch (error) {
        console.error('Error fetching rooms:', error)
    }
}

const createRoom = async () => {
    try {
        creating.value = true
        await axios.post(
            `/admin/rooms`,
            newRoom.value,
            { headers: { Authorization: `Bearer ${authStore.token}` } }
        )
        await fetchRooms()
        showCreateRoomModal.value = false
        newRoom.value = { name: '', description: '' }
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to create room')
    } finally {
        creating.value = false
    }
}

const deleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
        await axios.delete(`/admin/rooms/${roomId}`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        await fetchRooms()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete room')
    }
}

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}

onMounted(() => {
    // All roles fetch the rooms list
    fetchRooms()
})
</script>