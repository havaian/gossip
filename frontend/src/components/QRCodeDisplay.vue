<script setup>
import { defineProps, ref, onMounted } from 'vue'
import QRCode from 'qrcode.vue'

const props = defineProps({
    url: {
        type: String,
        required: true
    },
    roomName: {
        type: String,
        default: 'Anonymous Room'
    },
    size: {
        type: Number,
        default: 200
    }
})

const copied = ref(false)

function copyUrlToClipboard() {
    navigator.clipboard.writeText(props.url).then(() => {
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)
    })
}
</script>

<template>
    <div class="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-center mb-2">{{ roomName }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
            Scan this code or share the link to join the room
        </p>

        <div class="bg-white p-4 rounded-lg">
            <QRCode :value="url" :size="size" level="H" />
        </div>

        <div class="mt-4 w-full">
            <div class="flex items-center">
                <input type="text" readonly :value="url" class="input text-sm w-full" />
                <button @click="copyUrlToClipboard"
                    class="ml-2 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    :class="{ 'bg-success': copied }">
                    <span v-if="!copied">Copy</span>
                    <span v-else>✓</span>
                </button>
            </div>
        </div>
    </div>
</template>