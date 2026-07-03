<script setup lang="ts">
import { onMounted } from 'vue';
import { useAppStore } from '@/stores/app';

import Header from "./Header.vue";

const appStore = useAppStore();

onMounted(async () => {
  try {
    appStore.loadAppConfig();
  } catch (error) {
    console.error('Failed to load app config:', error);
  }
});
</script>

<template>
  <el-scrollbar height="100vh" wrap-class="perfect-scrollbar" :always="false">
    <el-container>
      <Header />
      <el-main class="container">
        <router-view />
      </el-main>
      <el-footer> </el-footer>
    </el-container>
  </el-scrollbar>
</template>

<style>
.text-center {
  text-align: center;
}

.el-container {
  flex-direction: column;
}
</style>
