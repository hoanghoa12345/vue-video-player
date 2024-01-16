<script setup lang="ts">
  import Header from "./Header.vue";

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
