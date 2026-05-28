<template>
  <div class="login-page">
    <AppToast />
    <div class="login-top-bar" />

    <!-- 背景纹理 -->
    <div class="grid-bg" />

    <div class="login-center">
      <!-- Brand -->
      <div class="login-brand fade-up">
        <!-- 专属 logo 占位：拿到图后在此放 <img src="..." class="login-logo-img" /> -->
        <div class="login-zh">复新生涯</div>
        <div class="login-en">FusionCareer</div>
        <div class="login-school">复旦大学新闻学院 · 就业与职业发展平台</div>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card fade-up" style="animation-delay:.1s">
        <!-- Tab 切换 -->
        <div class="tab-switch" :data-active="tab">
          <button
            class="tab-btn"
            :class="{ active: tab === 'uis' }"
            @click="tab = 'uis'"
          >
            <i class="ti ti-school" />
            <span>复旦 UIS</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: tab === 'admin' }"
            @click="tab = 'admin'"
          >
            <i class="ti ti-shield-lock" />
            <span>账户密码</span>
          </button>
          <div class="tab-indicator" />
        </div>

        <!-- UIS 登录 -->
        <transition name="fade-slide" mode="out-in">
          <div v-if="tab === 'uis'" key="uis" class="tab-panel">
            <div class="uis-illust">
              <div class="uis-logo">
                <i class="ti ti-shield-check" />
              </div>
              <div class="uis-text">
                <div class="uis-line1">Fudan UIS</div>
                <div class="uis-line2">复旦大学统一身份认证 · 安全跳转</div>
              </div>
            </div>

            <button class="btn-primary btn-red" @click="loginUIS">
              <i class="ti ti-external-link" />
              <span>前往 UIS 登录</span>
            </button>

            <div class="helper-text">
              <i class="ti ti-info-circle" />
              将跳转至复旦大学统一身份认证页面，认证后自动返回
            </div>
          </div>

          <!-- 管理员登录 -->
          <div v-else key="admin" class="tab-panel">
            <form class="form" @submit.prevent="loginAdmin">
              <div class="field" :class="{ 'has-value': form.username }">
                <i class="ti ti-user field-icon" />
                <input
                  v-model="form.username"
                  type="text"
                  autocomplete="username"
                  placeholder=" "
                  required
                >
                <label>账号</label>
              </div>

              <div class="field" :class="{ 'has-value': form.password }">
                <i class="ti ti-lock field-icon" />
                <input
                  v-model="form.password"
                  :type="showPwd ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder=" "
                  required
                >
                <label>密码</label>
                <button
                  type="button"
                  class="field-toggle"
                  tabindex="-1"
                  @click="showPwd = !showPwd"
                >
                  <i :class="showPwd ? 'ti ti-eye-off' : 'ti ti-eye'" />
                </button>
              </div>

              <div class="form-row">
                <label class="remember">
                  <input v-model="form.remember" type="checkbox">
                  <span class="checkbox-box"><i class="ti ti-check" /></span>
                  <span>记住我</span>
                </label>
                <a href="#" class="forgot">忘记密码？</a>
              </div>

              <button type="submit" class="btn-primary btn-red">
                <i class="ti ti-login-2" />
                <span>登 录</span>
              </button>
            </form>
          </div>
        </transition>
      </div>

      <div class="login-footer fade-up" style="animation-delay:.28s">
        登录即代表同意 <a href="#">服务协议</a> 与 <a href="#">隐私政策</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import AppToast from '@/components/AppToast.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const tab = ref('uis') // 'uis' | 'admin'
const showPwd = ref(false)

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const loginUIS = () => {
  window.location.assign('/fudan/login')
}

const loginAdmin = () => {
  toast.show('后端未提供学生端账号密码登录；管理端请走内网 internal API 或后续管理员鉴权方案。', 'default', 4200)
}
</script>

<style scoped>
/* ---------- 页面骨架 ---------- */
.login-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.login-top-bar {
  height: 4px;
  background: var(--red);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

/* ---------- 背景纹理 ---------- */

.grid-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(0, 0, 0, .025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, .025) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 80%);
}

/* ---------- 主体 ---------- */
.login-center {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2.5rem 1rem; position: relative; z-index: 1;
}

/* ---------- Brand ---------- */
.login-brand  { text-align: center; margin-bottom: 2.25rem; }

.login-zh     { font-family: var(--font-display); font-size: 2.4rem; font-weight: 900; color: var(--red); letter-spacing: -.01em; line-height: 1.15; }
.login-en     { font-family: 'Space Grotesk', var(--font-sans); font-size: .82rem; font-weight: 600; color: var(--gold); letter-spacing: .24em; text-transform: uppercase; margin-top: .45rem; }
.login-school { font-size: .9rem; color: var(--ink-2); margin-top: .7rem; letter-spacing: .02em; }

/* ---------- 登录卡片 ---------- */
.login-card {
  width: 100%; max-width: 520px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2.25rem 2.25rem 2rem;
  box-shadow:
    var(--shadow-md),
    0 24px 60px -20px rgba(140, 21, 27, .18),
    0 8px 24px -8px rgba(0, 0, 0, .08);
  position: relative; overflow: hidden;
}
.login-card::before {
  content: none;
}

/* ---------- Tab ---------- */
.tab-switch {
  position: relative;
  display: grid; grid-template-columns: 1fr 1fr;
  background: var(--bg);
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 1.75rem;
}
.tab-btn {
  position: relative; z-index: 1;
  background: transparent; border: none; cursor: pointer;
  padding: .8rem .4rem;
  font-family: var(--font-sans); font-size: .92rem; font-weight: 600;
  color: var(--ink-2);
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  border-radius: 8px;
  transition: color var(--t);
}
.tab-btn i { font-size: 1.1rem; }
.tab-btn.active { color: var(--ink); }
.tab-indicator {
  position: absolute; z-index: 0;
  top: 5px; bottom: 5px; left: 5px;
  width: calc(50% - 5px);
  background: var(--bg-card);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  transition: transform var(--t);
}
.tab-switch[data-active="admin"] .tab-indicator { transform: translateX(100%); }

/* ---------- Panel ---------- */
.tab-panel { display: flex; flex-direction: column; }

/* ---------- UIS 区块 ---------- */
.uis-illust {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.25rem 1.3rem;
  background: linear-gradient(135deg, var(--red-light) 0%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid var(--red-border);
  border-radius: 14px;
  margin-bottom: 1.4rem;
}
.uis-logo {
  width: 52px; height: 52px; border-radius: 13px;
  background: var(--red); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; flex-shrink: 0;
  box-shadow: 0 6px 14px rgba(140, 21, 27, .28);
}
.uis-line1 { font-family: 'Space Grotesk', var(--font-sans); font-weight: 700; font-size: 1.05rem; color: var(--ink); letter-spacing: .02em; }
.uis-line2 { font-size: .78rem; color: var(--ink-2); margin-top: .2rem; }

.helper-text {
  margin-top: 1rem;
  font-size: .76rem; color: var(--ink-3);
  display: flex; align-items: center; gap: .4rem; justify-content: center;
}
.helper-text i { font-size: .95rem; }

/* ---------- 表单 ---------- */
.form { display: flex; flex-direction: column; gap: 1rem; }
.field {
  position: relative;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: border-color var(--t), box-shadow var(--t), background var(--t);
}
.field input {
  width: 100%;
  min-height: 56px;
  padding: 0 3.1rem 0 6.35rem;
  background: transparent; border: none; outline: none;
  font-family: var(--font-sans); font-size: 1rem; color: var(--ink);
  box-sizing: border-box;
}
.field label {
  position: absolute; left: 2.7rem; top: 50%;
  transform: translateY(-50%);
  width: 3.1rem;
  font-size: .9rem; color: var(--ink-3);
  font-weight: 600;
  pointer-events: none;
  transition: color var(--t);
  background: transparent;
}
.field:focus-within label,
.field.has-value label {
  color: var(--red);
}
.field:focus-within {
  border-color: var(--red);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--red-light);
}
.field-icon {
  position: absolute; left: 1rem; top: 50%;
  transform: translateY(-50%);
  color: var(--ink-3);
  font-size: 1.1rem;
  transition: color var(--t);
}
.field:focus-within .field-icon { color: var(--red); }
.field-toggle {
  position: absolute; right: .65rem; top: 50%;
  transform: translateY(-50%);
  background: transparent; border: none; cursor: pointer;
  color: var(--ink-3); padding: .35rem; font-size: 1.05rem;
  border-radius: 6px;
}
.field-toggle:hover { color: var(--ink); }

/* form row */
.form-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: -.1rem; margin-bottom: .25rem;
}
.remember {
  display: flex; align-items: center; gap: .5rem;
  font-size: .82rem; color: var(--ink-2); cursor: pointer;
  user-select: none;
}
.remember input { display: none; }
.checkbox-box {
  width: 17px; height: 17px;
  border: 1.5px solid var(--border); border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-card);
  transition: all var(--t);
}
.checkbox-box i { font-size: .78rem; color: #fff; opacity: 0; transition: opacity var(--t); }
.remember input:checked + .checkbox-box {
  background: var(--red); border-color: var(--red);
}
.remember input:checked + .checkbox-box i { opacity: 1; }
.forgot { font-size: .82rem; color: var(--red); text-decoration: none; }
.forgot:hover { text-decoration: underline; }

/* ---------- 按钮 ---------- */
.btn-primary {
  width: 100%; padding: .95rem;
  border-radius: 12px; border: none;
  font-family: var(--font-sans); font-size: .98rem; font-weight: 600;
  color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: .55rem;
  transition: all var(--t);
  position: relative; overflow: hidden;
  letter-spacing: .02em;
}
.btn-primary i { font-size: 1.15rem; }
.btn-primary::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, .25) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform .6s;
}
.btn-primary:hover::after { transform: translateX(100%); }
.btn-red  { background: var(--red); box-shadow: 0 8px 18px rgba(140, 21, 27, .25); }
.btn-red:hover  { background: var(--red-hover); transform: translateY(-1px); box-shadow: 0 10px 22px rgba(140, 21, 27, .32); }
.btn-gold { background: var(--gold); box-shadow: 0 8px 18px rgba(184, 135, 30, .25); }
.btn-gold:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 10px 22px rgba(184, 135, 30, .32); }

/* ---------- 底部 ---------- */
.login-footer { margin-top: 1.75rem; font-size: .78rem; color: var(--ink-3); text-align: center; }
.login-footer a { color: var(--red); text-decoration: none; }
.login-footer a:hover { text-decoration: underline; }

/* ---------- 动画 ---------- */
.fade-slide-enter-active,
.fade-slide-leave-active { transition: opacity .25s, transform .25s; }
.fade-slide-enter-from { opacity: 0; transform: translateY(6px); }
.fade-slide-leave-to   { opacity: 0; transform: translateY(-6px); }

/* ---------- 响应式 ---------- */
@media (max-width: 560px) {
  .login-card  { padding: 1.5rem 1.4rem 1.4rem; }
  .login-zh    { font-size: 2rem; }
}
</style>
