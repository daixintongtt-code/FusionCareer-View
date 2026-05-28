<template>
  <Teleport to="body">
    <div class="toast-wrap">
      <TransitionGroup name="t">
        <div v-for="t in toasts" :key="t.id" :class="['toast', t.type !== 'default' && `toast-${t.type}`]">
          <i :class="['ti', iconMap[t.type] || 'ti-info-circle']" />
          {{ t.msg }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
const iconMap = { success: 'ti-check', error: 'ti-alert-circle', default: 'ti-info-circle' }
</script>

<style scoped>
.t-enter-active { animation: slideUp 0.2s ease both; }
.t-leave-active { transition: opacity 0.2s, transform 0.2s; }
.t-leave-to     { opacity: 0; transform: translateY(6px); }
</style>
