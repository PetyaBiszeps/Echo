import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ErrorView from '@/views/ErrorView.vue'
import ChatView from '@/views/ChatView.vue'
import AuthView from '@/views/AuthView.vue'
import useAuthStore from '@/stores/auth'
import {
    createRouter,
    createWebHistory
} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [{
        path: '/auth',
        component: AuthLayout,
        meta: {
            guest: true
        },
        children: [{
            path: '',
            name: 'auth',
            component: AuthView
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
        }, {
            path: 'chat/:chatId',
            name: 'chat',
            component: ChatView,
            props: true
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
router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()

    if (to.meta.public) {
        return next()
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return next({
            name: 'auth'
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