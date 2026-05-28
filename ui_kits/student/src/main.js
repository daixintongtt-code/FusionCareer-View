import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'
import { consumeUrlToken, getToken } from '@/lib/api'

const hadTokenFromUrl = consumeUrlToken()

const app = createApp(App)
app.use(router)

router.isReady().then(() => {
  if (hadTokenFromUrl && router.currentRoute.value.path === '/login' && getToken()) {
    router.replace('/home')
  }
})

app.mount('#app')
