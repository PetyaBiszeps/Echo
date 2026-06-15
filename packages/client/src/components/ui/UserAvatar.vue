<script setup lang="ts">
import {
  computed
} from 'vue'

const {
  avatar = null,
  username = null,
  size = 'md',
  showPresence = false,
  isOnline = false
} = defineProps<{
  avatar?: string | null
  username?: string | null
  size?: 'sm' | 'md' | 'lg'
  showPresence?: boolean
  isOnline?: boolean
}>()

const normalizedAvatar = computed(() => avatar?.trim() || null)
const displayName = computed(() => username?.trim() || 'Unknown user')
const initials = computed(() => getInitials(displayName.value))

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return '?'
  }

  if (parts.length > 1) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || '?'
  }

  return Array.from(parts[0]).slice(0, 2).join('').toUpperCase() || '?'
}
</script>

<template>
  <span
    :class="['userAvatar', size, {
      online: showPresence && isOnline
    }]"
    :aria-label="displayName"
  >
    <img
      v-if="normalizedAvatar"
      :src="normalizedAvatar"
      :alt="displayName"
    >

    <span
      v-else
      :class="['userAvatarInitials']"
      aria-hidden="true"
    >
      {{ initials }}
    </span>

    <span
      v-if="showPresence && isOnline"
      :class="['userAvatarPresence']"
      aria-label="Online"
    />
  </span>
</template>
