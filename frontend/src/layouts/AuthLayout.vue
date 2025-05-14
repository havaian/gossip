<script setup>
// Auth layout for login and register pages
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <!-- Header -->
        <header class="bg-white dark:bg-gray-800 shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <h1 class="text-2xl font-bold text-primary">Anonymous Messaging System</h1>
            </div>
        </header>

        <!-- Main content -->
        <main class="flex-grow flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <router-view />
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-white dark:bg-gray-800 shadow-inner py-4">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>&copy; {{ new Date().getFullYear() }} Anonymous Messaging System. All rights reserved.</p>
            </div>
        </footer>
    </div>
</template>