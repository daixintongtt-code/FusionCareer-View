import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/',         redirect: '/login' },
  { path: '/login',    component: () => import('@/views/LoginView.vue'),    meta: { title: '登录' } },
  { path: '/home',     component: () => import('@/views/HomeView.vue'),     meta: { title: '岗位列表' } },
  { path: '/job/:id',  component: () => import('@/views/JobDetailView.vue'),meta: { title: '岗位详情' } },
  { path: '/profile',  component: () => import('@/views/ProfileView.vue'),  meta: { title: '个人中心' } },
  { path: '/admin',    component: () => import('@/views/AdminView.vue'),    meta: { title: '管理后台' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach(to => {
  document.title = `${to.meta.title || '复新生涯'} — FusionCareer`
})

export default router
