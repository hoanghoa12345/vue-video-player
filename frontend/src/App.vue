<template>
  <router-view v-if="appStore.initialize" />
  <el-container v-else class="loading-screen">
    <img class="logo__image--large" width="48" height="48" src="/images/logo.webp" alt="logo" />
    <div class="spinner" />
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

onMounted(async () => {
  await appStore.loadAppConfig();
});
</script>

<style scoped>
.logo__image--large {
  width: 48px;
  height: 48px;
}
.loading-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: var(--el-bg-color);
}
.spinner {
  border: 2px solid var(--el-fill-color-dark);
  border-top: 2px solid var(--el-color-primary);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
