<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <RouterLink class="brand" to="/home">
        <div class="brand-dot"><i class="ti ti-map-pin-filled" /></div>
        <div>
          <div class="brand-zh">复新生涯</div>
          <div class="brand-en">FusionCareer</div>
        </div>
      </RouterLink>
      <div class="nav-links">
        <RouterLink class="nav-link" to="/home"><i class="ti ti-briefcase" /> 岗位</RouterLink>
        <RouterLink class="nav-link" to="/profile"><i class="ti ti-user" /> 个人中心</RouterLink>
      </div>
      <div class="nav-right">
        <RouterLink class="nav-avatar" to="/profile" title="个人中心">{{ readInitial }}</RouterLink>
        <a href="#/login" class="nav-logout" title="退出登录" @click.prevent="logoutUser"><i class="ti ti-logout" /></a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { logoutUser, readUser } from '@/lib/auth'

const readName = ref('')
const readInitial = computed(() => readName.value?.trim().charAt(0) || '我')

onMounted(async () => {
  try {
    const readCurrentUser = await readUser()
    readName.value = readCurrentUser?.username || ''
  } catch {
    readName.value = ''
  }
})
</script>

<style scoped>
.nav-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-3);
  font-size: 1rem;
  padding: 4px;
  border-radius: var(--r-sm);
  text-decoration: none;
  transition: color var(--t);
}
.nav-logout:hover { color: var(--ink); }
</style>
