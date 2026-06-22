import useAuthStore from '@/store/auth.ts'
import {
  createRouter,
  createWebHistory
} from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: {
      guest: true
    },
    children: [{
      path: '',
      name: 'auth',
      component: () => import('@/views/AuthView.vue')
    }]
  }, {
    path: '/:pathMatch(.*)*',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: {
      public: true,
      status: 404
    },
    children: [{
      path: '',
      name: '404',
      component: () => import('@/views/ErrorView.vue')
    }]
  }, {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [{
      path: '',
      name: 'app',
      component: () => import('@/views/AppView.vue')
    }]
  }]
})

// Guard
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    return true
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'auth'
    }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return {
      name: 'app'
    }
  }
  return true
})

export default router
