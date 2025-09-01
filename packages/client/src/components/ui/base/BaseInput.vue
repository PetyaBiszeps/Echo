<script setup lang="ts">
// const props = defineProps({
//   type: {
//     type: String,
//     required: true
//   },
//   placeholder: {
//     type: String,
//     required: true
//   },
//   disabled: {
//     type: Boolean,
//     default: false
//   },
//   readonly: {
//     type: Boolean,
//     default: false
//   }
// })
// const emit = defineEmits(['focus', 'blur'])
//
// const model = defineModel<string | number>({
//   required: true
// })
</script>

<template>
  <label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"

      @focus="emit('focus')"
      @blur="emit('blur')"
    >
  </label>
</template>