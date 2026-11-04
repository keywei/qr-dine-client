import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Vant from 'vant';
import 'vant/lib/index.css';
import '@/style.css';

import App from '@/App.vue';
import router from '@/router';
import i18n from '@/locales';
import { setupPreventZoom } from '@/utils/preventZoom';

setupPreventZoom();

createApp(App).use(createPinia()).use(router).use(Vant).use(i18n).mount('#app');
