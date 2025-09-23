import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import InboxView from '@/views/InboxView.vue'
import ErrorView from '@/views/ErrorView.vue'
import useAuthStore from '@/stores/auth'

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
    }, {
        path: '/err',
        name: 'err',
        component: ErrorView,
        meta: { public: true }
    }, {
        path: '/:pathMatch(.*)*',
        redirect: '/err'
    }]
})

    // Guard
router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    if (to.meta.public) {
        return next()
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return next({
            name: 'login'
        })
    }

    if (to.meta.guest && auth.isAuthenticated) {
        return next({
            name: 'inbox'
        })
    }

    return next()
})

export default router