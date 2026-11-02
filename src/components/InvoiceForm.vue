<template>
  <van-cell-group inset class="!m-0 shadow-sm rounded-xl overflow-hidden">
    <van-field
      :model-value="taxId"
      :label="$t('checkout.taxIdLabel')"
      :placeholder="$t('checkout.taxIdPlaceholder')"
      maxlength="8"
      type="digit"
      @update:model-value="$emit('update:taxId', $event)"
    />
    <van-field
      :model-value="invoiceCarrier"
      :label="$t('checkout.carrierLabel')"
      :placeholder="$t('checkout.carrierPlaceholder')"
      maxlength="8"
      @update:model-value="$emit('update:invoiceCarrier', $event)"
    />
  </van-cell-group>
</template>

<script setup lang="ts">
defineProps<{
  taxId: string;
  invoiceCarrier: string;
}>();

defineEmits<{
  (e: 'update:taxId', val: string): void;
  (e: 'update:invoiceCarrier', val: string): void;
}>();
</script>
