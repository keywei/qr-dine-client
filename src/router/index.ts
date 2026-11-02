import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Order from '@/views/Order.vue';
import Checkout from '@/views/Checkout.vue';
import Payment from '@/views/Payment.vue';
import Tracking from '@/views/Tracking.vue';
import Queue from '@/views/Queue.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/order' },
  { path: '/order', name: 'Order', component: Order },
  { path: '/checkout', name: 'Checkout', component: Checkout },
  { path: '/payment', name: 'Payment', component: Payment },
  { path: '/tracking/:orderNo', name: 'Tracking', component: Tracking },
  { path: '/queue', name: 'Queue', component: Queue },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
