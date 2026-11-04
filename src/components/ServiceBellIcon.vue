<template>
  <svg
    class="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- 服務鈴 (Bell) -->
    <g v-if="name === 'bell'">
      <path d="M12 3v3" />
      <path d="M19 15a7 7 0 0 0-14 0" />
      <path d="M4 17h16a1 1 0 0 0 1-1H3a1 1 0 0 0 1 1z" />
      <path d="M10 20h4" />
      <circle cx="12" cy="3" r="1" />
    </g>

    <!-- 加水 / 添茶 (Water / Cup) -->
    <g v-else-if="name === 'water'">
      <path d="M5 8h11a1 1 0 0 1 1 1v4a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6V9a1 1 0 0 1 1-1z" />
      <path d="M17 10h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" />
      <path d="M8 3v2" />
      <path d="M13 3v2" />
      <path d="M3 21h15" />
    </g>

    <!-- 餐具 / 紙巾 (Utensils) -->
    <g v-else-if="name === 'utensils'">
      <path d="M18 4v16" />
      <path d="M21 4a3 3 0 0 0-3 3v3h3V4z" />
      <path d="M6 4v6a2 2 0 0 0 2 2v8" />
      <path d="M10 4v6a2 2 0 0 1-2 2" />
      <path d="M8 4v6" />
    </g>

    <!-- 清理桌面 (Clean / Sparkles) -->
    <g v-else-if="name === 'clean'">
      <path d="M4 20h16" />
      <path d="M14 4l-9 9 3 3 9-9-3-3z" />
      <path d="M17 7l-2-2" />
      <path d="M19 14l1.5 1.5" />
      <path d="M19 17l1.5-1.5" />
      <circle cx="7" cy="6" r="1.5" />
    </g>

    <!-- 現場協助 (Assist / Hand / Staff) -->
    <g v-else-if="name === 'assist'">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M17 11l2 2 3-3" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: 'bell' | 'water' | 'utensils' | 'clean' | 'assist';
}>();
</script>

