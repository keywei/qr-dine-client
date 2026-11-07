<template>
  <div v-if="isAvailable" class="fixed bottom-24 right-4 z-40">
    <button
      class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center transition-transform active:scale-90 border-2 border-white ring-2 ring-amber-300/40"
      :class="{ 'opacity-70': isCoolingDown }"
      :disabled="isCoolingDown"
      @click="openBell"
    >
      <ServiceBellIcon v-if="!isCoolingDown" name="bell" class="w-6 h-6 text-white stroke-[2]" />
      <span v-else class="text-xs font-bold font-mono text-white">{{ cooldownSeconds }}s</span>
    </button>
  </div>

  <van-popup v-model:show="popupVisible" round position="bottom" class="p-4" :style="{ maxHeight: '75%' }">
    <div class="flex flex-col gap-3">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="text-base font-bold text-slate-800">{{ $t('serviceBell.title') }}</span>
          <span class="text-xs text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full font-mono">
            {{ $t('serviceBell.table', { code: tableCode }) }}
          </span>
        </div>
        <van-icon name="cross" class="text-xl text-slate-400 cursor-pointer hover:text-slate-600 transition-colors p-0.5" @click="popupVisible = false" />
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-for="opt in options"
          :key="opt.type"
          class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-[#f8fafc] hover:bg-slate-100 active:scale-98 transition-all text-left"
          :disabled="calling"
          @click="submitCall(opt.type)"
        >
          <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/60">
            <ServiceBellIcon :name="opt.iconName" class="w-5 h-5 text-amber-600" />
          </div>
          <span class="text-sm font-semibold text-slate-800">{{ $t(opt.labelKey) }}</span>
        </button>
      </div>

      <div class="flex gap-2 items-center pt-1">
        <van-field v-model="customNote" :placeholder="$t('serviceBell.customPlaceholder')" class="!bg-slate-50 !rounded-xl text-xs" />
        <van-button
          round
          size="small"
          type="primary"
          color="#0f0f11"
          class="shrink-0 !text-white !font-bold px-4 shadow-sm"
          :loading="calling"
          @click="submitCall('OTHER', customNote)"
        >
          {{ $t('serviceBell.submit') }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ServiceCallRequest } from '@/types/service';
import { useServiceBellClient } from '@/composables/useServiceBellClient';
import ServiceBellIcon from './ServiceBellIcon.vue';

type BellIconType = 'bell' | 'water' | 'utensils' | 'clean' | 'assist';

const props = defineProps<{ tableCode: string }>();

const { isAvailable, isCoolingDown, cooldownSeconds, calling, popupVisible, openBell, submitCall } =
  useServiceBellClient(() => props.tableCode);

const customNote = ref('');

const options: { type: ServiceCallRequest['type']; labelKey: string; iconName: BellIconType }[] = [
  { type: 'WATER', labelKey: 'serviceBell.options.water', iconName: 'water' },
  { type: 'UTENSILS', labelKey: 'serviceBell.options.utensils', iconName: 'utensils' },
  { type: 'CLEAN', labelKey: 'serviceBell.options.clean', iconName: 'clean' },
  { type: 'ASSIST', labelKey: 'serviceBell.options.assist', iconName: 'assist' },
];
</script>
