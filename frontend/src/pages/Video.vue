<script setup lang="ts">
import VideoPlayer from "@/components/video-player/index.vue";
import { useRouter, useRoute } from "vue-router";
import { useQuery, useMutation } from "villus";
import { onMounted, onUpdated, watch } from "vue";
import { GetVideo, UpdateViewVideo, VideosRelated } from "@/services/graphql";
import { backendUrl, getVideoPath } from "@/services/api";
import defaultThumbnailVideo from "@/assets/thumbnail-placeholder.webp"
import { useTitle } from '@vueuse/core'

const router = useRouter();
const route = useRoute();
const title = useTitle()

const {
  data,
  error,
  isFetching,
  execute: fetchVideo,
} = useQuery({
  query: GetVideo,
  variables: {
    id: route.params.id,
  },
});

const {
  data: videosRelated,
  error: err,
  isFetching: isLoading,
} = useQuery({
  query: VideosRelated,
  variables: {
    id: route.params.id,
  },
});

const { data: updateView, execute } = useMutation(UpdateViewVideo);
const variables = {
  id: route.params.id,
};

onMounted(() => {
  execute(variables);
  // console.log(updateView);
  window.scrollTo(0, 0);
});

onUpdated(() => {
  console.log("On Updated");
  console.log("[info] Video ID: ", route.params.id);
  fetchVideo({
    variables: {
      id: route.params.id,
    },
  });
});

watch(data, (data) => {
  title.value = `${data.video.title} | MyClip`
  navigator.mediaSession.metadata = new MediaMetadata({
    title: data.video.title,
    artist: data.video.uploadedBy.name,
    album: data.video.title,
    artwork: [
      {
        src: `${backendUrl}/image/${data.video.thumbnail}`,
        sizes: "640x360",
        type: "image/png",
      },
    ],
  });
});
</script>

<template>
  <el-row :gutter="20">
    <el-col
      v-loading="isFetching"
      :span="16"
      :xs="24"
      :sm="24"
      :md="16"
      :lg="16"
      :xl="16">
      <div v-if="data">
        <VideoPlayer :src="getVideoPath(data.video.filePath)" />
        <div>
          <h3 class="video-title">{{ data.video.title }}</h3>
          <span class="video-description">{{ data.video.description }}</span>
        </div>
      </div>

      <el-result v-if="error" title="404" sub-title="Sorry, request error">
        <template #icon>
          <el-image :src="defaultThumbnailVideo" />
        </template>
        <template #extra>
          <el-button type="primary" @click="router.back()">Back</el-button>
        </template>
      </el-result>
    </el-col>
    <el-col :span="8" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
      <div
        class="video-item"
        v-for="video in videosRelated?.videosRelated"
        :key="video._id">
        <router-link :to="{ name: 'Video', params: { id: video._id } }">
          <img
            class="video-thumbnail__image"
            height="100"
            :src="backendUrl + '/image/' + video.thumbnail"
            :src-data="defaultThumbnailVideo"
            :alt="video.title" />
        </router-link>
        <div style="margin-left: 1rem">
          <span class="video-thumbnail__title">{{ video.title }}</span>
          <div class="el-link el-link--info video-info video-thumbnail__description">
            <p>{{ video.uploadedBy.name }}</p>
            <span>{{ video.views }} views</span>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
<style>
.video-item {
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
}
.video-title {
  font-size: var(--el-font-size-extra-large);
  font-weight: bold;
  color: var(--el-color-info-dark-2);
  margin: 10px 0;
}
.video-description {
  font-size: var(--el-font-size-medium);
  color: var(--el-text-color-regular);
  font-weight: var(--el-font-weight-primary);
}
.video-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.video-thumbnail__title {
  font-size: 14px;
}
.video-thumbnail__description {
  font-size: 12px;
}
.video-thumbnail__description>p {
  margin-block-start: 0.5rem;
  margin-block-end: 0.5rem;
}
.video-thumbnail__image {
  height: 100px;
  border-radius: 0.25rem;
}
</style>
