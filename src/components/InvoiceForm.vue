<template>
  <van-cell-group inset class="!m-0 shadow-sm rounded-xl overflow-hidden">
    <van-field
      :model-value="taxId"
      :label="$t('checkout.taxIdLabel')"
      :placeholder="$t('checkout.taxIdPlaceholder')"
      maxlength="8"
      type="digit"
      :error-message="taxIdError"
      error-message-align="left"
      @update:model-value="onUpdateTaxId"
      @blur="$emit('blur', 'taxId')"
    />
    <van-field
      :model-value="invoiceCarrier"
      :label="$t('checkout.carrierLabel')"
      :placeholder="$t('checkout.carrierPlaceholder')"
      maxlength="8"
      :error-message="carrierError"
      error-message-align="left"
      @update:model-value="onUpdateCarrier"
      @blur="$emit('blur', 'invoiceCarrier')"
    />
  </van-cell-group>
</template>

<script setup lang="ts">
defineProps<{
  taxId: string;
  invoiceCarrier: string;
  taxIdError?: string;
  carrierError?: string;
}>();

const emit = defineEmits<{
  (e: 'update:taxId', val: string): void;
  (e: 'update:invoiceCarrier', val: string): void;
  (e: 'keyin', field: 'taxId' | 'invoiceCarrier'): void;
  (e: 'blur', field: 'taxId' | 'invoiceCarrier'): void;
}>();

const onUpdateTaxId = (val: string) => {
  emit('update:taxId', val);
  emit('keyin', 'taxId');
};

const onUpdateCarrier = (val: string) => {
  emit('update:invoiceCarrier', val);
  emit('keyin', 'invoiceCarrier');
};
</script>
