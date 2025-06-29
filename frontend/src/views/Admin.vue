<template>
  <div>
    <!-- Use Shared Header -->
    <Navbar show-back-button back-button-text="Back to Home" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Stats Overview -->
      <div class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Rooms</dt>
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.totalRooms }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.totalUsers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Active Rooms</dt>
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.activeRooms }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Messages</dt>
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.totalMessages }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rooms Management -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Rooms</h2>
          <button @click="showCreateRoomModal = true" class="btn btn-primary">
            Create Room
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="room in rooms" :key="room._id">
                <td class="px-6 py-4 whitespace-nowrap">{{ room.name }}</td>
                <td class="px-6 py-4">{{ room.description }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="room.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ room.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{{ room.moderator?.name || 'Not assigned' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ room.presenter?.name || 'Not assigned' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button @click="editRoom(room)" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button @click="deleteRoom(room._id)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Users Management -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Users</h2>
          <button @click="showCreateUserModal = true" class="btn btn-primary">
            Create User
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Room</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user._id">
                <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                    'bg-blue-100 text-blue-800': user.role === 'admin',
                    'bg-green-100 text-green-800': user.role === 'moderator',
                    'bg-purple-100 text-purple-800': user.role === 'presenter'
                  }">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{{ user.assignedRoom?.name || 'None' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button @click="editUser(user)" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button @click="deleteUser(user._id)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Create/Edit Room Modal -->
    <div v-if="showCreateRoomModal || showEditRoomModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">{{ showEditRoomModal ? 'Edit Room' : 'Create Room' }}</h3>
        <form @submit.prevent="showEditRoomModal ? updateRoom() : createRoom()">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input v-model="roomForm.name" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea v-model="roomForm.description" class="input" rows="3"></textarea>
            </div>
            <div v-if="showEditRoomModal">
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select v-model="roomForm.isActive" class="input">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
            <div v-if="showEditRoomModal">
              <label class="block text-sm font-medium text-gray-700">Moderator</label>
              <select v-model="roomForm.moderator" class="input">
                <option v-for="user in moderators" :key="user._id" :value="user._id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            <div v-if="showEditRoomModal">
              <label class="block text-sm font-medium text-gray-700">Presenter</label>
              <select v-model="roomForm.presenter" class="input">
                <option v-for="user in presenters" :key="user._id" :value="user._id">
                  {{ user.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-2">
            <button type="button" @click="closeRoomModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Saving...' : (showEditRoomModal ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateUserModal || showEditUserModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">{{ showEditUserModal ? 'Edit User' : 'Create User' }}</h3>
        <form @submit.prevent="showEditUserModal ? updateUser() : createUser()">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input v-model="userForm.name" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="userForm.email" type="email" class="input" required :disabled="showEditUserModal" />
            </div>
            <div v-if="!showEditUserModal">
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input v-model="userForm.password" type="password" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select v-model="userForm.role" class="input">
                <option value="moderator">Moderator</option>
                <option value="presenter">Presenter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div v-if="showEditUserModal">
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select v-model="userForm.isActive" class="input">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
            <div v-if="showEditUserModal && (userForm.role === 'moderator' || userForm.role === 'presenter')">
              <label class="block text-sm font-medium text-gray-700">Assigned Room</label>
              <select v-model="userForm.assignedRoom" class="input">
                <option value="">None</option>
                <option v-for="room in rooms" :key="room._id" :value="room._id">
                  {{ room.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-2">
            <button type="button" @click="closeUserModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Saving...' : (showEditUserModal ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import Navbar from '../components/layout/Navbar.vue'
import axios from '../services/api'

const authStore = useAuthStore()

const stats = ref({
  totalRooms: 0,
  activeRooms: 0,
  totalUsers: 0,
  totalMessages: 0
})

const rooms = ref([])
const users = ref([])
const showCreateRoomModal = ref(false)
const showEditRoomModal = ref(false)
const showCreateUserModal = ref(false)
const showEditUserModal = ref(false)
const loading = ref(false)

const roomForm = ref({
  name: '',
  description: '',
  isActive: true,
  moderator: '',
  presenter: ''
})

const userForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'moderator',
  isActive: true,
  assignedRoom: ''
})

const moderators = computed(() => {
  return users.value.filter(user => user.role === 'moderator')
})

const presenters = computed(() => {
  return users.value.filter(user => user.role === 'presenter')
})

const fetchStats = async () => {
  try {
    const response = await axios.get(`/admin/stats`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

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

const fetchUsers = async () => {
  try {
    const response = await axios.get(`/admin/users`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    users.value = response.data.users
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const createRoom = async () => {
  try {
    loading.value = true
    await axios.post(
      `/admin/rooms`,
      roomForm.value,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    await fetchRooms()
    await fetchUsers() // Refresh users to get updated assignments
    closeRoomModal()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to create room')
  } finally {
    loading.value = false
  }
}

const editRoom = (room) => {
  roomForm.value = {
    ...room,
    moderator: room.moderator?._id || '',
    presenter: room.presenter?._id || ''
  }
  showEditRoomModal.value = true
}

const updateRoom = async () => {
  try {
    loading.value = true
    await axios.put(
      `/admin/rooms/${roomForm.value._id}`,
      roomForm.value,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    await fetchRooms()
    await fetchUsers() // Refresh users to get updated assignments
    closeRoomModal()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to update room')
  } finally {
    loading.value = false
  }
}

const deleteRoom = async (roomId) => {
  if (!confirm('Are you sure you want to delete this room? This will also remove all associated messages.')) return

  try {
    await axios.delete(`/admin/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    await fetchRooms()
    await fetchUsers() // Refresh users to get updated assignments
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to delete room')
  }
}

const createUser = async () => {
  try {
    loading.value = true
    await axios.post(
      `/admin/users`,
      userForm.value,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    await fetchUsers()
    closeUserModal()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to create user')
  } finally {
    loading.value = false
  }
}

const editUser = (user) => {
  userForm.value = {
    ...user,
    assignedRoom: user.assignedRoom?._id || ''
  }
  showEditUserModal.value = true
}

const updateUser = async () => {
  try {
    loading.value = true
    await axios.put(
      `/admin/users/${userForm.value._id}`,
      userForm.value,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    await fetchUsers()
    closeUserModal()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to update user')
  } finally {
    loading.value = false
  }
}

const deleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user?')) return

  try {
    await axios.delete(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    await fetchUsers()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to delete user')
  }
}

const closeRoomModal = () => {
  showCreateRoomModal.value = false
  showEditRoomModal.value = false
  roomForm.value = {
    name: '',
    description: '',
    isActive: true,
    moderator: '',
    presenter: ''
  }
}

const closeUserModal = () => {
  showCreateUserModal.value = false
  showEditUserModal.value = false
  userForm.value = {
    name: '',
    email: '',
    password: '',
    role: 'moderator',
    isActive: true,
    assignedRoom: ''
  }
}

onMounted(() => {
  fetchStats()
  fetchRooms()
  fetchUsers()
})
</script>