<script setup lang="ts">
import VideoPlayer from "@/components/video-player/index.vue";
import { useRouter, useRoute } from "vue-router";
import { useQuery, useMutation } from "villus";
import { onMounted, onUpdated, ref, watch } from "vue";
import { GetVideo, UpdateViewVideo, VideosRelated } from "@/services/graphql";
import { backendUrl, getVideoPath } from "@/services/api";
import defaultThumbnailVideo from "@/assets/thumbnail-placeholder.webp";
import Comments from "@/components/video-comments/Comments.vue"
import { useTitle } from "@vueuse/core";
import _ from "lodash-es";
import { getUsernameInitial } from "@/utils/user";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";

const router = useRouter();
const route = useRoute();
const title = useTitle();
const showMore = ref<boolean>(false);
dayjs.locale("en");
dayjs.extend(relativeTime);

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
  title.value = `${data.video.title} | MyClip`;
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
        <VideoPlayer
          :src="getVideoPath(data.video.filePath)"
          :auto-play="false" />
        <div>
          <h3 class="video-title">{{ data.video.title }}</h3>
          <div class="video-info__wrapper">
            <div class="video-info__timestamp">
              <span>{{ data.video.views }} views </span>
              <span class="mr-2"> • </span>
              <span>{{ dayjs(+data.video.createdAt).fromNow() }}</span>
            </div>
            <div class="video-info__reaction">
              <div class="video-info__like_number">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 16 16">
                  <path
                    fill="currentColor"
                    d="m8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385c.92 1.815 2.834 3.989 6.286 6.357c3.452-2.368 5.365-4.542 6.286-6.357c.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
                </svg>
                <svg
                  v-show="false"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 16 16">
                  <path
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="M8 1.314C12.438-3.248 23.534 4.735 8 15C-7.534 4.736 3.562-3.248 8 1.314" />
                </svg>
                <span>0</span>
              </div>
            </div>
          </div>
          <el-divider />
          <div class="video__user-upload">
            <el-avatar>{{
              getUsernameInitial(data.video.uploadedBy.name)
            }}</el-avatar>
            <div>
              <p class="video__user-name">{{ data.video.uploadedBy.name }}</p>
              <p class="video__subscribe-number">0 subscriber</p>
            </div>
            <div class="video__user-subscribe">
              <el-button type="primary" size="large" round>Subscribe</el-button>
            </div>
          </div>
          <span v-if="!showMore" class="video-description"
            >{{ _.truncate(data.video.description, { length: 200 })
            }}<span
              role="button"
              v-show="data.video.description.length > 200"
              @click="showMore = true"
              >View more</span
            ></span
          >
          <span v-else class="video-description"
            >{{ data.video.description
            }}<span role="button" @click="showMore = false"
              >View less</span
            ></span
          >
          <Comments :comments="data.video.comments" :video-id="data.video._id" />
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
          <div
            class="el-link el-link--info video-info video-thumbnail__description">
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
  font-size: var(--el-font-size-small);
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
.video-thumbnail__description > p {
  margin-block-start: 0.5rem;
  margin-block-end: 0.5rem;
}
.video-thumbnail__image {
  height: 100px;
  border-radius: 0.25rem;
}
</style>
