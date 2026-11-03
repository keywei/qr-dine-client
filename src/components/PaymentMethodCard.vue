<template>
  <button
    type="button"
    :disabled="disabled || loading"
    class="w-full bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs transition-all text-left active:bg-slate-50 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" :class="badgeClass">
        <van-loading v-if="loading" size="18px" />
        <span v-else>{{ icon }}</span>
      </div>
      <div class="min-w-0">
        <div class="text-[15px] font-bold text-slate-800 leading-tight truncate">{{ title }}</div>
        <div class="text-xs text-slate-400 mt-0.5 truncate">{{ subtitle }}</div>
      </div>
    </div>
    <div class="flex items-center gap-1.5 shrink-0 ml-2">
      <span class="text-sm font-extrabold text-emerald-600">{{ actionText }}</span>
      <van-icon name="arrow" class="text-slate-300 text-sm" />
    </div>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    icon: string;
    badgeClass?: string;
    actionText: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    badgeClass: 'bg-slate-100 text-slate-700',
    loading: false,
    disabled: false,
  }
);

defineEmits<{
  (e: 'click'): void;
}>();
</script>
