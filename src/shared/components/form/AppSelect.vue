<script setup lang="ts">
export interface SelectOption {
  value: string | number
  label: string
}

withDefaults(
  defineProps<{
    modelValue?: string | number | null
    options: SelectOption[]
    label?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    error?: string
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: 'Pilih...',
    required: false,
    disabled: false,
    error: '',
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
    <select
      :value="modelValue ?? ''"
      :required="required"
      :disabled="disabled"
      class="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400"
      :class="error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-300'"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="text-[11px] text-red-600">{{ error }}</p>
  </div>
</template>
