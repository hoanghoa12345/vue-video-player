<script setup lang="ts">
// import { useQuery } from "villus";
import { useTitle } from "@vueuse/core";
import { watchEffect, onMounted, ref } from "vue";
import Video from "@/components/video-item/index.vue";
// import { AllVideos } from "@/services/graphql";
import api from "@/services/api";
import { Objects } from "@/utils/types";

const title = useTitle();
const data = ref<Objects | null>(null);
const loading = ref<boolean>(false);
const error = ref<boolean>(false);

// const { data, isFetching, error, execute } = useQuery({
//   query: AllVideos,
//   cachePolicy: "network-only",
// });

watchEffect(() => {
  title.value = "MyClip - Play your favorite videos";
})

onMounted(() => {
  loading.value = true;
  api.getListVideo().then((res) => {
    data.value = res.data;
    loading.value = false;
  }).catch((err) => {
    error.value = true;
    loading.value = false;
  });
})
</script>

<script lang="ts">
export default {
  name: "IndexPage",
};
</script>

<template>
  <!-- Infinite Scroll -->
  <section class="video-section" v-loading="loading">
    <Video :video="video" v-for="video in data?.objects" :key="video.id" />
    <el-backtop target=".perfect-scrollbar" :right="50" :bottom="50" :visibility-height="50" />
  </section>
  <el-result v-if="data?.total === 0" icon="warning" title="Error" sub-title="Not have video!"></el-result>
  <el-result v-if="error" title="503" icon="info" sub-title="Sorry, Service Unavailable">
    <template #extra>
      <el-button type="primary">Try again</el-button>
    </template>
  </el-result>
</template>

<style>
.video-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 3rem 1rem;
  padding: 3rem 0;
  margin: 0 1.5rem;
}
</style>
