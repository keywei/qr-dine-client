import { ref, computed } from 'vue';
import api from '@/api';
import type { Category } from '@/types';

export const useMenuCategories = () => {
  const categories = ref<Category[]>([]);
  const selectedCatId = ref(0);
  const searchQuery = ref('');

  const fetchMenu = async () => {
    try {
      const res: any = await api.get('/menu');
      if (res.success && res.data) categories.value = res.data;
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCats = computed(() => {
    let list = selectedCatId.value === 0 ? categories.value : categories.value.filter((c) => c.id === selectedCatId.value);
    if (!searchQuery.value) return list;
    const q = searchQuery.value.toLowerCase().trim();
    return list
      .map((c) => ({
        ...c,
        items: c.items.filter((d) => d.name.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q))),
      }))
      .filter((c) => c.items.length > 0);
  });

  return { categories, selectedCatId, searchQuery, filteredCats, fetchMenu };
};
