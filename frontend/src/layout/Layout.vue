<script setup lang="ts">
import Header from "./Header.vue";
</script>

<template>
  <el-container>
    <Header />
    <el-scrollbar height="calc(100vh - 60px)" :always="true">
      <el-main>
        <router-view />
      </el-main>
      <el-footer> </el-footer>
    </el-scrollbar>
  </el-container>
</template>

<style>
.text-center {
  text-align: center;
}
.el-container {
  flex-direction: column;
}
</style>
