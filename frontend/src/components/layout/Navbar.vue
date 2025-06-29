<template>
  <nav class="bg-white shadow mt-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <!-- Logo and Title -->
          <a href='https://bolt.new/' target="_blank" rel="noopener noreferrer" class="flex items-center space-x-3">
            <img src="/logo.png" alt="Gossip MUN Logo" class="w-24 h-24" />
            <div class="flex flex-col">
              <h1 class="text-xl font-bold text-gray-900">Gossip MUN</h1>
              <router-link to="/" class="text-sm text-gray-600 hover:text-gray-900">
                gossip.ytech.space
              </router-link>
            </div>
          </a>
        </div>

        <!-- Navigation Items -->
        <div class="flex items-center space-x-4">
          <!-- Room Name (if available) -->
          <span v-if="roomName" class="text-gray-700">{{ roomName }}</span>
          
          <!-- Admin Link -->
          <router-link 
            v-if="authStore.isAdmin" 
            to="/admin" 
            class="text-gray-700 hover:text-gray-900"
          >
            Admin Dashboard
          </router-link>

          <!-- User Info and Actions -->
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
            <span class="text-gray-700">{{ authStore.user?.name }}</span>
            
            <!-- Role Badge -->
            <span class="px-2 py-1 text-xs font-medium rounded-full" :class="{
              'bg-blue-100 text-blue-800': authStore.isAdmin,
              'bg-green-100 text-green-800': authStore.isModerator,
              'bg-purple-100 text-purple-800': authStore.isPresenter
            }">
              {{ authStore.user?.role }}
            </span>

            <!-- Action Buttons (from parent component) -->
            <slot name="actions"></slot>

            <!-- Home/Back Button -->
            <router-link 
              v-if="showBackButton" 
              to="/" 
              class="btn btn-secondary"
            >
              {{ backButtonText }}
            </router-link>

            <!-- Logout Button -->
            <button @click="handleLogout" class="btn btn-secondary">
              Logout
            </button>
          </div>

          <!-- Login Button (for public pages) -->
          <router-link 
            v-else 
            to="/login" 
            class="btn btn-primary"
          >
            Login
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  roomName: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  backButtonText: {
    type: String,
    default: 'Back to Home'
  }
})

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>