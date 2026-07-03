<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

onMounted(async () => {
  try {
    appStore.loadAppConfig();
  } catch (error) {
    console.error('Failed to load app config:', error);
  }
});
</script>
