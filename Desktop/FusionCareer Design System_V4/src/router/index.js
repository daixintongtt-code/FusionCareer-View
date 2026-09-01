import { createRouter, createWebHashHistory } from 'vue-router'
import { readToken } from '@/lib/api'
import { readUser } from '@/lib/auth'

const routes = [
  { path: '/',         redirect: '/login' },
  { path: '/login',    component: () => import('@/views/LoginView.vue'),    meta: { title: '登录' } },
  { path: '/home',     component: () => import('@/views/HomeView.vue'),     meta: { title: '岗位列表', requiresAuth: true } },
  { path: '/job/:id',  component: () => import('@/views/JobDetailView.vue'),meta: { title: '岗位详情', requiresAuth: true } },
  { path: '/profile',  component: () => import('@/views/ProfileView.vue'),  meta: { title: '个人中心', requiresAuth: true } },
  { path: '/admin',    component: () => import('@/views/AdminView.vue'),    meta: { title: '管理后台', requiresAuth: true, roles: ['ADMIN'] } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

async function guardRoute(readRoute) {
  if (!readRoute.meta.requiresAuth && readRoute.path !== '/login') return true
  if (!readToken()) return readRoute.meta.requiresAuth ? '/login' : true
  try {
    const readCurrentUser = await readUser()
    if (readRoute.path === '/login') {
      return readCurrentUser?.role === 'ADMIN' ? '/admin' : '/home'
    }
    const readRoles = readRoute.meta.roles || []
    if (readRoles.length && !readRoles.includes(readCurrentUser?.role)) return '/home'
    return true
  } catch {
    return readRoute.path === '/login' ? true : '/login'
  }
}

router.beforeEach(guardRoute)

router.afterEach(to => {
  document.title = `${to.meta.title || '复新生涯'} — FusionCareer`
})

export default router
