<template>
  <router-view v-if="appStore.initialize" />
  <el-container v-else class="loading-screen">
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
  border: 4px solid var(--el-fill-color-dark);
  border-top: 4px solid var(--el-color-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
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
