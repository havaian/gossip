import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

// Pages
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import RoomManagement from '../views/admin/RoomManagement.vue'
import UserManagement from '../views/admin/UserManagement.vue'
import ModeratorDashboard from '../views/moderator/Dashboard.vue'
import MessageModeration from '../views/moderator/MessageModeration.vue'
import PresenterView from '../views/presenter/PresenterView.vue'
import PublicSubmission from '../views/public/MessageSubmission.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                name: 'Login',
                component: Login,
                meta: { requiresGuest: true }
            },
            {
                path: 'register',
                name: 'Register',
                component: Register,
                meta: { requiresGuest: true }
            }
        ]
    },
    {
        path: '/admin',
        component: DashboardLayout,
        meta: { requiresAuth: true, role: 'admin' },
        children: [
            {
                path: '',
                name: 'AdminDashboard',
                component: AdminDashboard
            },
            {
                path: 'rooms',
                name: 'RoomManagement',
                component: RoomManagement
            },
            {
                path: 'users',
                name: 'UserManagement',
                component: UserManagement
            }
        ]
    },
    {
        path: '/moderator',
        component: DashboardLayout,
        meta: { requiresAuth: true, role: 'moderator' },
        children: [
            {
                path: '',
                name: 'ModeratorDashboard',
                component: ModeratorDashboard
            },
            {
                path: 'moderation/:roomId',
                name: 'MessageModeration',
                component: MessageModeration,
                props: true
            }
        ]
    },
    {
        path: '/presenter/:roomId',
        name: 'PresenterView',
        component: PresenterView,
        meta: { requiresAuth: true, role: 'presenter' },
        props: true
    },
    {
        path: '/r/:roomId',
        name: 'PublicSubmission',
        component: PublicSubmission,
        props: true
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const isAuthenticated = authStore.isAuthenticated
    const userRole = authStore.user?.role

    // Routes that require guest access
    if (to.meta.requiresGuest && isAuthenticated) {
        // Redirect to the appropriate dashboard based on user role
        if (userRole === 'admin') {
            return next('/admin')
        } else if (userRole === 'moderator') {
            return next('/moderator')
        } else if (userRole === 'presenter') {
            // Presenter should have an assigned room
            const roomId = authStore.user?.assignedRoom
            if (roomId) {
                return next(`/presenter/${roomId}`)
            } else {
                return next('/login')
            }
        }
        return next('/')
    }

    // Routes that require authentication
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next('/login')
    }

    // Routes that require specific role
    if (to.meta.role && isAuthenticated && to.meta.role !== userRole) {
        return next('/login')
    }

    next()
})

export default router