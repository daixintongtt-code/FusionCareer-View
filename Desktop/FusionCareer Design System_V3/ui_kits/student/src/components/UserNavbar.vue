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
        <RouterLink class="nav-avatar" to="/profile" title="个人中心">李</RouterLink>
        <RouterLink to="/login" class="nav-logout" title="退出登录"><i class="ti ti-logout" /></RouterLink>
      </div>
    </div>
  </nav>
</template>

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
