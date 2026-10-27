<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    type?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    error?: string
    hint?: string
  }>(),
  {
    modelValue: '',
    label: '',
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
    error: '',
    hint: '',
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-xs font-semibold text-slate-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400"
      :class="error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-300'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-[11px] text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="text-[11px] text-slate-400">{{ hint }}</p>
  </div>
</template>
