<template>
  <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
    <div class="flex justify-between items-center pb-2 border-b border-slate-100">
      <span class="text-sm font-bold text-slate-700">{{ $t('queue.yourTicket') }}</span>
      <van-tag round type="primary" size="medium">{{ $t('queue.partySizeText', { size: ticket.partySize }) }}</van-tag>
    </div>

    <div class="flex flex-col items-center justify-center py-3 bg-slate-50 rounded-xl">
      <span class="text-xs text-slate-500 font-medium">{{ $t('queue.yourTicket') }}</span>
      <span class="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight my-1">
        #{{ ticket.ticketNo }}
      </span>
      <span class="text-xs text-slate-400 font-mono">{{ ticket.customerPhone }}</span>
    </div>

    <div class="grid grid-cols-2 gap-3 text-center">
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div class="text-xs text-slate-500 mb-1">{{ $t('queue.currentCalling') }}</div>
        <div class="text-xl font-extrabold text-slate-800 font-mono">
          {{ currentCallingNo ? `#${currentCallingNo}` : '-' }}
        </div>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div class="text-xs text-slate-500 mb-1">{{ $t('queue.waitingAhead') }}</div>
        <div class="text-xl font-extrabold text-amber-600 font-mono">
          {{ waitingCount }} <span class="text-xs text-slate-500 font-normal">{{ $t('queue.groupsUnit') }}</span>
        </div>
      </div>
    </div>

    <van-notice-bar
      v-if="ticket.status === 'CALLING'"
      class="rounded-xl shadow-xs"
      left-icon="warning-o"
      color="#b45309"
      background="#fef3c7"
      wrapable
      :scrollable="false"
      :text="$t('queue.noticeCalling', { count: ticket.callCount })"
    />
    <van-notice-bar
      v-else-if="ticket.status === 'EXPIRED'"
      class="rounded-xl shadow-xs"
      left-icon="cross"
      color="#b91c1c"
      background="#fee2e2"
      wrapable
      :scrollable="false"
      :text="$t('queue.noticeExpired')"
    />
    <van-notice-bar
      v-else
      class="rounded-xl shadow-xs"
      left-icon="volume-o"
      color="#15803d"
      background="#f0fdf4"
      wrapable
      :scrollable="false"
      :text="$t('queue.noticeNormal')"
    />

    <van-button
      v-if="ticket.status === 'EXPIRED' || ticket.status === 'CANCELLED' || ticket.status === 'SEATED'"
      type="primary"
      round
      block
      size="normal"
      color="#16a34a"
      class="!font-bold shadow-sm mt-1"
      @click="$emit('clear')"
    >
      {{ $t('queue.reTakeBtn') }}
    </van-button>
    <van-button
      v-else
      type="default"
      round
      block
      size="normal"
      class="!font-bold !text-slate-600 !border-slate-300 mt-1"
      @click="$emit('cancel')"
    >
      {{ $t('queue.cancelBtn') }}
    </van-button>
  </div>
</template>

<script setup lang="ts">
import type { QueueTicket } from '@/types';

defineProps<{
  ticket: QueueTicket;
  currentCallingNo: number | null;
  waitingCount: number;
}>();

defineEmits<{
  (e: 'cancel'): void;
  (e: 'clear'): void;
}>();
</script>
