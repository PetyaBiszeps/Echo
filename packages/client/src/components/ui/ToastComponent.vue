<script setup lang="ts">
import useToastStore from '@/stores/toast'
import {
  computed
} from 'vue'

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
    title: message.type,
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
</script>

<template>
  <div :class="['messageWrapper']">
    <div
      v-for="(data, index) in payload"
      :key="index"
      :class="['message', data.type]"
    >
      <strong>{{ getIcon(data.type) }} | {{ data.message }}</strong>
    </div>
  </div>
</template>