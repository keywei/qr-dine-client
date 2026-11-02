import { createI18n } from 'vue-i18n';
import zhTW from './zh-TW.json';

const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'zh-TW',
  messages: {
    'zh-TW': zhTW,
  },
});

export default i18n;
