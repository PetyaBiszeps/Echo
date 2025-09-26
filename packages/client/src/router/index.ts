import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginView from '@/views/LoginView.vue'
import ErrorView from '@/views/ErrorView.vue'
import ChatView from '@/views/ChatView.vue'
import useAuthStore from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [{
        path: '/login',
        component: AuthLayout,
        meta: {
            guest: true
        },
        children: [{
            path: '',
            name: 'login',
            component: LoginView
        }]
    }, {
        path: '/',
        component: DefaultLayout,
        meta: {
            requiresAuth: true
        },
        children: [{
            path: '',
            name: 'inbox',
            component: ChatView
        }]
    }, {
        path: '/:pathMatch(.*)*',
        component: AuthLayout,
        meta: {
            public: true,
            status: 404
        },
        children: [{
            path: '',
            name: '404',
            component: ErrorView
        }]
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