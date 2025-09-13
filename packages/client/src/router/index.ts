import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import InboxView from '@/views/InboxView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [{
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { guest: true }
        }, {
        path: '/',
        name: 'inbox',
        component: InboxView,
        meta: { requiresAuth: true }
    }]
})

export default router