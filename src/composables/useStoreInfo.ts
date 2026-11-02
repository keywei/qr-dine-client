import { ref } from 'vue';
import api from '@/api';
import type { StoreSetting } from '@/types';

export const useStoreInfo = () => {
  const store = ref<StoreSetting | null>(null);
  const loading = ref(false);

  const fetchStoreInfo = async () => {
    loading.value = true;
    try {
      store.value = await api.get<StoreSetting>('/store');
    } finally {
      loading.value = false;
    }
  };

  return {
    store,
    loading,
    fetchStoreInfo,
  };
};
