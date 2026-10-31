import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Order from '@/views/Order.vue';
import Checkout from '@/views/Checkout.vue';
import Tracking from '@/views/Tracking.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/order',
  },
  {
    path: '/order',
    name: 'Order',
    component: Order,
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
  },
  {
    path: '/tracking/:orderNo',
    name: 'Tracking',
    component: Tracking,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
