<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <van-nav-bar
      :title="$t('queue.title')"
      :left-text="$t('queue.backToOrder')"
      left-arrow
      @click-left="router.push('/order')"
    />

    <div class="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
      <QueueBoardCard
        v-if="ticket"
        :ticket="ticket"
        :current-calling-no="currentCallingNo"
        :waiting-count="waitingCount"
        @cancel="cancelTicket"
        @clear="clearTicket"
      />
      <QueueFormCard
        v-else
        :loading="submitting"
        @submit="(data) => takeTicket(data.customerPhone, data.partySize)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQueue } from '@/composables/useQueue';
import QueueFormCard from '@/components/QueueFormCard.vue';
import QueueBoardCard from '@/components/QueueBoardCard.vue';

const router = useRouter();
const { ticket, currentCallingNo, waitingCount, submitting, takeTicket, cancelTicket, clearTicket } = useQueue();
</script>
