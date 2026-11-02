<template>
  <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
    <div class="border-b border-slate-100 pb-2">
      <h3 class="m-0 text-base font-bold text-slate-800">{{ $t('queue.formTitle') }}</h3>
    </div>

    <van-cell-group inset class="!m-0 rounded-xl overflow-hidden border border-slate-100">
      <van-field
        v-model="customerPhone"
        :label="$t('queue.phoneLabel')"
        :placeholder="$t('queue.phonePlaceholder')"
        type="tel"
        maxlength="10"
      />
      <van-cell :title="$t('queue.partySizeLabel')">
        <template #value>
          <van-stepper v-model="partySize" min="1" max="10" integer />
        </template>
      </van-cell>
    </van-cell-group>

    <van-button
      type="primary"
      round
      block
      size="large"
      color="#0284c7"
      :loading="loading"
      class="!font-bold !h-11 shadow-md"
      @click="onSubmit"
    >
      {{ $t('queue.submitBtn') }}
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from 'vant';
import { validateQueueForm } from '@/utils/queueValidation';

defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', data: { customerPhone: string; partySize: number }): void;
}>();

const customerPhone = ref('');
const partySize = ref(2);

const onSubmit = () => {
  const valid = validateQueueForm({
    customerPhone: customerPhone.value,
    partySize: partySize.value,
  });
  if (!valid.success) return showToast(valid.error);
  emit('submit', valid.data);
};
</script>
