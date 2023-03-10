<script lang="ts" setup>
import { UploadFilled, Upload } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

const router = useRouter();

const navigateUpload = () => {
  router.push("/admin/video/create");
};
</script>

<template>
  <div class="container">
    <div>
      <div class="flex item-center" style="justify-content: space-between">
        <div class="flex item-center">
          <h4 class="mr-2">
            <router-link class="title" to="/admin/video">Videos</router-link>
          </h4>
          <el-icon :size="25"><UploadFilled /></el-icon>
        </div>
        <el-button type="primary" @click="navigateUpload"
          >Upload<el-icon class="el-icon--right"><Upload /></el-icon
        ></el-button>
      </div>
    </div>
    <router-view />
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}

.item-center {
  align-items: center;
}

.mr-2 {
  margin-right: 1rem;
}

.title {
  text-decoration: none;
  color: black;
  font-weight: bold;
  font-size: 16px;
}
</style>
