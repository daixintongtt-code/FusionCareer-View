import { ref } from 'vue'

const toasts = ref([])
let _id = 0

export function useToast() {
  function show(msg, type = 'default', ms = 2800) {
    const id = ++_id
    toasts.value.push({ id, msg, type })
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, ms)
  }
  return {
    toasts,
    show,
    success: m => show(m, 'success'),
    error:   m => show(m, 'error'),
  }
}
