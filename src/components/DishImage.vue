<template>
  <img
    :src="currentSrc"
    :alt="alt || ''"
    class="object-cover"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import defaultDishImg from '@/assets/default-dish.jpg';

const props = withDefaults(
  defineProps<{
    src?: string | null;
    alt?: string;
    fallback?: string;
  }>(),
  {
    src: '',
    alt: '',
    fallback: defaultDishImg,
  },
);

const hasError = ref(false);

watch(
  () => props.src,
  () => {
    hasError.value = false;
  },
);

const currentSrc = computed(() => {
  if (hasError.value || !props.src) {
    return props.fallback;
  }
  return props.src;
});

const onError = () => {
  hasError.value = true;
};
</script>
