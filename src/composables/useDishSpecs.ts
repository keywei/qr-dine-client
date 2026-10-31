import { ref, computed } from 'vue';
import type { MenuItem, MenuItemOptionGroup, MenuItemOption } from '@/types';

export const useDishSpecs = () => {
  const currentDish = ref<MenuItem | null>(null);
  const selectedQuantity = ref(1);
  const selectedOptionsMap = ref<Record<number, MenuItemOption[]>>({});

  const openSpecs = (dish: MenuItem) => {
    currentDish.value = dish;
    selectedQuantity.value = 1;
    selectedOptionsMap.value = {};

    dish.options?.forEach((grp) => {
      if (grp.type === 'SINGLE' && grp.options?.length > 0) {
        selectedOptionsMap.value[grp.id] = [grp.options[0]];
      } else {
        selectedOptionsMap.value[grp.id] = [];
      }
    });
  };

  const isOptionSelected = (groupId: number, optName: string) => {
    const opts = selectedOptionsMap.value[groupId] || [];
    return opts.some((o) => o.name === optName);
  };

  const toggleOption = (grp: MenuItemOptionGroup, opt: MenuItemOption) => {
    if (grp.type === 'SINGLE') {
      selectedOptionsMap.value[grp.id] = [opt];
      return;
    }
    const list = selectedOptionsMap.value[grp.id] || [];
    const idx = list.findIndex((o) => o.name === opt.name);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(opt);
    }
    selectedOptionsMap.value[grp.id] = [...list];
  };

  const currentUnitPrice = computed(() => {
    if (!currentDish.value) return 0;
    let price = Number(currentDish.value.price);
    Object.values(selectedOptionsMap.value).forEach((opts) => {
      opts.forEach((o) => {
        price += Number(o.extraPrice || 0);
      });
    });
    return price;
  });

  const validateRequired = (): string | null => {
    for (const grp of currentDish.value?.options || []) {
      if (grp.isRequired) {
        const selected = selectedOptionsMap.value[grp.id] || [];
        if (selected.length === 0) return `請選擇 ${grp.title}`;
      }
    }
    return null;
  };

  const getSpecsText = (): string => {
    const parts: string[] = [];
    Object.values(selectedOptionsMap.value).forEach((opts) => {
      opts.forEach((o) => {
        parts.push(o.extraPrice > 0 ? `${o.name} (+${o.extraPrice})` : o.name);
      });
    });
    return parts.join(', ');
  };

  return {
    currentDish,
    selectedQuantity,
    selectedOptionsMap,
    currentUnitPrice,
    openSpecs,
    isOptionSelected,
    toggleOption,
    validateRequired,
    getSpecsText,
  };
};
