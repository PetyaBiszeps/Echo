<script setup lang="ts">
import BaseMultiselect from '@/components/ui/base/BaseMultiselect.vue'
import BaseSelect from '@/components/ui/base/BaseSelect.vue'
import BaseInput from '@/components/ui/base/BaseInput.vue'
import {
  computed
} from 'vue'

const {
  id,
  name,
  mode = 'input',
  type = 'text',
  placeholder,
  size = 'sm',
  variant = 'default',
  disabled = false,
  readonly = false,
  autocomplete = 'off'
} = defineProps<{
  id: string
  name: string
  mode?: 'input' | 'select' | 'multiselect'
  type?: string
  placeholder: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default'
  disabled?: boolean
  readonly?: boolean
  autocomplete?: string
}>()
const emit = defineEmits(['focus', 'blur'])

  // Constants
const model = defineModel<string | number>({
  required: true
})

const chooseComponent = computed(() => {
  return {
    input: BaseInput,
    select: BaseSelect,
    multiselect: BaseMultiselect
  }[mode]
})

// const hasValue = computed(() => {
//   const val = model.value
//
//   if (Array.isArray(val)) {
//     return val.length > 0
//   }
//
//   if (typeof val === 'object' && val !== null) {
//     return Object.keys(val).length > 0
//   }
//   return val !== undefined && val !== null && val !== ''
// })
</script>

<template>
  <main
    :class="[
      'inputWrapper',
      `inputWrapper--${mode}`,
      `inputWrapper-${variant}`
    ]"
  >
    <label :for="id">
      <component
        v-model="model"

        :is="chooseComponent"
        :id="id"
        :name="name"
        :type="type"
        :placeholder="placeholder"
        :data-size="size"
        :data-variant="variant"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"

        @focus="emit('focus')"
        @blur="emit('blur')"
      />
    </label>
  </main>
</template>