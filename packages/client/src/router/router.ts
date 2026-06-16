import {
  createRouter,
  createWebHistory
} from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      guest: true
    },
    children: [{
      path: '',
      name: 'app',
      component: () => import('@/views/AppView.vue')
    }]
  }]
})

export default router
