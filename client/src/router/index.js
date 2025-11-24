import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Auth/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-room',
    name: 'CreateRoom',
    component: () => import('@/views/Room/CreateRoom.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/join-room',
    name: 'JoinRoom',
    component: () => import('@/views/Room/JoinRoom.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/room/:code',
    name: 'Lobby',
    component: () => import('@/views/Room/Lobby.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/game/:code',
    name: 'GameScreen',
    component: () => import('@/views/Game/Screen.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else if (to.meta.requiresGuest && userStore.token) {
    next('/home')
  } else {
    next()
  }
})

export default router 