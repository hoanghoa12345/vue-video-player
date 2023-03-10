<script setup lang="ts">
import { useQuery } from "villus";
import Video from "@/components/video-item/index.vue";
import { AllVideos } from "@/services/graphql";

const { data, isFetching, error, execute } = useQuery({
  query: AllVideos,
  cachePolicy: "network-only",
});
</script>

<script lang="ts">
export default {
  name: "IndexPage",
};
</script>
<template>
  <!-- Infinite Scroll -->
  <section class="video-section" v-loading="isFetching">
    <Video :video="video" v-for="video in data?.videos" :key="video._id" />
    <el-backtop :right="100" :bottom="100" :visibility-height="50" />
  </section>
  <el-result
    v-if="data?.videos.length === 0"
    icon="warning"
    title="Error"
    sub-title="Not have video!"></el-result>
  <el-result
    v-if="error"
    title="503"
    icon="info"
    sub-title="Sorry, Service Unavailable">
    <template #extra>
      <el-button
        @click="execute({ cachePolicy: 'network-only' })"
        type="primary"
        >Try again</el-button
      >
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
