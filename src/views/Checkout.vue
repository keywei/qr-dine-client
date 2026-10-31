<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <van-nav-bar title="確認結帳" left-text="返回選餐" left-arrow @click-left="router.push('/order')" />

    <div class="flex-1 p-3.5 pb-24 flex flex-col gap-3.5 overflow-y-auto">
      <div class="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
        <span class="text-sm font-bold text-slate-800">用餐方式</span>
        <DiningBadge :dining-type="cartStore.diningType" :table-code="cartStore.tableCode" size="large" />
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
          <span class="text-sm font-bold text-slate-800">餐點明細</span>
          <span class="text-xs text-slate-500">共 {{ cartStore.totalCount }} 項</span>
        </div>
        <OrderItemRow v-for="item in cartStore.items" :key="item.id" :item="item" />
        <div class="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
          <span class="text-sm font-semibold text-slate-600">小計</span>
          <span class="text-base font-extrabold text-rose-600">NT$ {{ cartStore.totalAmount }}</span>
        </div>
      </div>

      <van-cell-group inset class="!m-0 shadow-sm rounded-xl overflow-hidden">
        <van-field v-model="customerPhone" label="聯絡電話" placeholder="外帶請填寫手機取餐憑證" type="tel" />
        <van-field v-model="customerNote" label="備註需求" placeholder="例：不要蔥、不要辣" rows="1" autosize />
      </van-cell-group>

      <PaymentMethodSelector v-model="paymentMethod" />
    </div>

    <div class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 px-4 flex justify-between items-center shadow-lg z-40">
      <div>
        <span class="text-xs text-slate-500">應付金額：</span>
        <span class="text-xl font-extrabold text-rose-600">NT$ {{ cartStore.totalAmount }}</span>
      </div>
      <van-button type="primary" round size="large" :loading="submitting" color="linear-gradient(to right, #e11d48, #be123c)" class="!w-44 !h-10.5 !font-bold" @click="onSubmit">
        確認送出訂單
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import api from '@/api';
import { useCartStore } from '@/stores/cart';
import type { PaymentMethod } from '@/types';
import DiningBadge from '@/components/DiningBadge.vue';
import OrderItemRow from '@/components/OrderItemRow.vue';
import PaymentMethodSelector from '@/components/PaymentMethodSelector.vue';

const router = useRouter();
const cartStore = useCartStore();
const customerPhone = ref('');
const customerNote = ref('');
const paymentMethod = ref<PaymentMethod>('ONLINE');
const submitting = ref(false);

const onSubmit = async () => {
  if (cartStore.items.length === 0) return router.push('/order');
  if (cartStore.diningType === 'TAKEOUT' && !customerPhone.value.trim()) {
    return showToast('外帶請提供聯絡電話方便取餐');
  }

  submitting.value = true;
  try {
    const payload = {
      diningType: cartStore.diningType,
      tableCode: cartStore.diningType === 'DINE_IN' ? cartStore.tableCode : undefined,
      customerPhone: customerPhone.value.trim(),
      customerNote: customerNote.value.trim(),
      paymentMethod: paymentMethod.value,
      items: cartStore.items.map((it) => ({ menuItemId: it.menuItemId, name: it.name, price: it.price, quantity: it.quantity, optionsText: it.optionsText })),
    };
    const res: any = await api.post('/orders', payload);
    if (res.success && res.data) {
      showToast({ message: '訂單建立成功！', icon: 'success' });
      cartStore.clearCart();
      router.replace(`/tracking/${res.data.orderNo}`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};
</script>
