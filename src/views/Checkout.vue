<template>
	<div class="min-h-screen bg-slate-50 flex flex-col">
		<van-nav-bar :title="$t('checkout.title')" :left-text="$t('checkout.backToMenu')" left-arrow @click-left="router.push('/order')" />

		<div class="flex-1 p-3.5 pb-24 flex flex-col gap-3.5 overflow-y-auto">
			<div class="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
				<span class="text-sm font-bold text-slate-800">{{ $t('checkout.diningType') }}</span>
				<DiningBadge :dining-type="cartStore.diningType" :table-code="cartStore.tableCode" size="large" />
			</div>

			<div class="bg-white rounded-xl p-4 shadow-sm">
				<div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
					<span class="text-sm font-bold text-slate-800">{{ $t('checkout.orderDetail') }}</span>
					<span class="text-xs text-slate-500">{{ $t('checkout.itemCount', { count: cartStore.totalCount }) }}</span>
				</div>
				<OrderItemRow v-for="item in cartStore.items" :key="item.id" :item="item" />
				<div class="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
					<span class="text-sm font-semibold text-slate-600">{{ $t('checkout.subtotal') }}</span>
					<span class="text-base font-extrabold text-rose-600">NT$ {{ cartStore.totalAmount }}</span>
				</div>
			</div>

			<van-cell-group inset class="!m-0 shadow-sm rounded-xl overflow-hidden">
				<van-field v-model="customerPhone" :label="$t('checkout.phoneLabel')" :placeholder="$t('checkout.phonePlaceholder')" type="tel" />
				<van-field v-model="customerNote" :label="$t('checkout.noteLabel')" :placeholder="$t('checkout.notePlaceholder')" rows="1" autosize />
			</van-cell-group>

			<PaymentMethodSelector v-model="paymentMethod" />
		</div>

		<div class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 px-4 flex justify-between items-center shadow-lg z-40">
			<div>
				<span class="text-xs text-slate-500">{{ $t('checkout.payableAmount') }}</span>
				<span class="text-xl font-extrabold text-rose-600">NT$ {{ cartStore.totalAmount }}</span>
			</div>
			<van-button type="primary" round size="large" :loading="submitting" color="linear-gradient(to right, #e11d48, #be123c)" class="!w-44 !h-10.5 !font-bold" @click="onSubmit"> {{ $t('checkout.submitOrder') }} </van-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useI18n } from 'vue-i18n';
import api from '@/api';
import { useCartStore } from '@/stores/cart';
import type { PaymentMethod } from '@/types';
import DiningBadge from '@/components/DiningBadge.vue';
import OrderItemRow from '@/components/OrderItemRow.vue';
import PaymentMethodSelector from '@/components/PaymentMethodSelector.vue';

const router = useRouter();
const { t } = useI18n();
const cartStore = useCartStore();
const customerPhone = ref('');
const customerNote = ref('');
const paymentMethod = ref<PaymentMethod>('ONLINE');
const submitting = ref(false);

const onSubmit = async () => {
	if (cartStore.items.length === 0) return router.push('/order');
	if (cartStore.diningType === 'TAKEOUT' && !customerPhone.value.trim()) {
		return showToast(t('checkout.phoneRequired'));
	}

	submitting.value = true;
	const payload = {
		diningType: cartStore.diningType,
		tableCode: cartStore.diningType === 'DINE_IN' ? cartStore.tableCode : undefined,
		customerPhone: customerPhone.value.trim(),
		customerNote: customerNote.value.trim(),
		paymentMethod: paymentMethod.value,
		items: cartStore.items.map((it) => ({ menuItemId: it.menuItemId, name: it.name, price: it.price, quantity: it.quantity, optionsText: it.optionsText }))
	};
	const res = await api.post<{ orderNo: string }>('/orders', payload);
	showToast({ message: t('checkout.orderCreated'), icon: 'success' });
	cartStore.clearCart();
	router.replace(`/tracking/${res.orderNo}`);
	submitting.value = false;
};
</script>
