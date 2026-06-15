<script setup lang="ts">
import useToastStore from '@/stores/toast'
import {
  computed
} from 'vue'
import type {
  IToast
} from '@/types'

// Init
const toaster = useToastStore()

// Constants
const errorMessages = computed(() => toaster.errorMessages || [])
const warningMessages = computed(() => toaster.warningMessages || [])
const successMessages = computed(() => toaster.successMessages || [])
const neutralMessages = computed(() => toaster.neutralMessages || [])

const payload = computed(() => {
  const errors = errorMessages.value
  const warnings = warningMessages.value
  const success = successMessages.value
  const neutrals = neutralMessages.value

  return [...errors, ...warnings, ...success, ...neutrals].map((message, index) => ({
    ...message,

    idx: index,
    toast: message,
    title: message.title ?? message.type,
    type: message.type,
    source: index < errors.length
      ? 'error' : index < errors.length + warnings.length
        ? 'warning' : index < errors.length + warnings.length + success.length
          ? 'success' : 'neutral'
  }))
})

// Methods
function getIcon(type: string) {
  switch (type) {
    case 'success':
      return '✓'
    case 'warning':
      return '!'
    case 'error':
      return '✗'
    case 'neutral':
      return '?'
    default:
      return '?'
  }
}

function handleToastClick(toast: IToast) {
  if (!toast.onClick) {
    return
  }

  toast.onClick()
  toaster.removeToaster(toast)
}
</script>

<template>
  <div :class="['messageWrapper']">
    <div
      v-for="(data, index) in payload"
      :key="index"
      :class="['message', data.type, {
        clickable: data.onClick
      }]"
      :role="data.onClick ? 'button' : undefined"
      :tabindex="data.onClick ? 0 : undefined"
      @click="handleToastClick(data.toast)"
      @keydown.enter="handleToastClick(data.toast)"
      @keydown.space.prevent="handleToastClick(data.toast)"
    >
      <strong>{{ getIcon(data.type) }} | {{ data.title }}</strong>

      <p v-if="data.message">
        {{ data.message }}
      </p>
    </div>
  </div>
</template>
