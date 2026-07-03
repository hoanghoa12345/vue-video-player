<script setup lang="ts">
import VideoPlayer from "@/components/video-player/index.vue";
import { useRouter, useRoute } from "vue-router";
// import { useQuery, useMutation } from "villus";
import { onMounted, onUpdated, ref, watch, watchEffect } from "vue";
// import {
//   GetVideo,
//   LikeVideo,
//   UpdateViewVideo,
//   VideosRelated,
// } from "@/services/graphql";
// import { backendUrl, getVideoPath } from "@/services/api";
import defaultThumbnailVideo from "@/assets/video-placeholder.webp";
import Comments from "@/components/video-comments/Comments.vue";
import LikeButton from "@/components/video-actions/LikeButton.vue";
import { useTitle } from "@vueuse/core";
import _ from "lodash-es";
import { getUsernameInitial } from "@/utils/user";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import { useUserStore } from "@/stores/user";
import api from "@/services/api";
import { IObject, Objects } from "@/utils/types";

const router = useRouter();
const route = useRoute();
const title = useTitle();
const showMore = ref<boolean>(false);
const userStore = useUserStore();
dayjs.locale("en");
dayjs.extend(relativeTime);

// const {
//   data,
//   error,
//   isFetching,
//   execute: fetchVideo,
// } = useQuery({
//   query: GetVideo,
//   variables: {
//     id: route.params.id,
//     userId: userStore.id,
//   },
// });

// const {
//   data: videosRelated,
//   error: err,
//   isFetching: isLoading,
// } = useQuery({
//   query: VideosRelated,
//   variables: {
//     id: route.params.id,
//   },
// });

// const { data: updateView, execute } = useMutation(UpdateViewVideo);
// const variables = {
//   id: route.params.id,
// };
// const { data: videoLikedId, execute: likeVideo } = useMutation(LikeVideo);

const data = ref<IObject>();
const loading = ref<boolean>(false);
const error = ref<boolean>(false);

const relatedVideos = ref<Objects | null>()
const relatedLoading = ref<boolean>(false)
const relatedError = ref<boolean>(false)

const like = ref<boolean>(false);

const fetchVideo = (id: string | string[]) => {
  loading.value = true
  api.getVideoById(id.toString()).then((res) => {
    data.value = res.data
    loading.value = false
  }).catch(() => {
    error.value = true
    loading.value = false
  })
}

const fetchRelatedVideo = (id: string | string[]) => {
  relatedLoading.value = true
  api.getRelatedVideos(id.toString()).then((res) => {
    relatedVideos.value = res.data
    relatedLoading.value = false
  }).catch((err) => {
    relatedError.value = true
    relatedLoading.value = false
  })
}

const fetchPageData = (id: string | string[]) => {
  fetchVideo(id);
  fetchRelatedVideo(id);
}

onMounted(() => {
  // execute(variables);
  // console.log(updateView);
  fetchPageData(route.params.id)
});


onUpdated(() => {
  // console.log("On Updated");
  // console.log("[info] Video ID: ", route.params.id);
  // fetchVideo({
  //   variables: {
  //     id: route.params.id,
  //     userId: userStore.id,
  //   },
  // });
});

watch(data, (data) => {
  const video = data?.object;
  if (video) {
    title.value = `${video?.title} | MyClip`;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: video.title,
      artist: video?.uploadedBy?.name,
      album: video.title,
      artwork: [
        {
          src: `${video.thumbnail}`,
          sizes: "640x360",
          type: "image/png",
        },
      ],
    });
  }

});

const scrollUp = () => {
  const scrollEl = document.querySelector<HTMLElement>(".perfect-scrollbar");
  if (!scrollEl)
    //throw new Error("Can't scroll to top");
    return;

  setTimeout(() => {
    if (scrollEl) {
      scrollEl.scroll({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }
  }, 500);
};

watch(
  () => route.params.id,
  (videoId: string | string[]) => {
    scrollUp();
    fetchPageData(videoId);
  }
);

// watchEffect(() => {
//   scrollUp();
// });
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="16" :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
      <el-skeleton :loading="loading" class="video-skeleton__player-wrapper"
        :animated="true">
        <template #template>
          <el-skeleton-item variant="image" class="video-skeleton__video" />
          <div class="video-skeleton__video-description">
            <el-skeleton-item variant="p" style="width: 100%" />
            <el-skeleton-item variant="p" style="width: 30%" />
            <el-skeleton-item variant="p" style="width: 60%" />
          </div>
        </template>
      </el-skeleton>
      <div v-if="data">
        <VideoPlayer :src="data.object.metadata.video_url" :auto-play="true" />
        <div id="video"></div>
        <div>
          <h3 class="video-title">{{ data.object?.title }}</h3>
          <div class="video-info__wrapper">
            <div class="video-info__timestamp">
              <span>{{ data.object?.views ?? 0 }} views </span>
              <span class="mr-2"> • </span>
              <span>{{ dayjs(data.object?.created_at).fromNow() }}</span>
            </div>
            <div class="video-info__reaction">
              <LikeButton :video-id="data.object?.id" :like-count="like ? 1 : 0" :is-like="like"
                @like-video="(id: string) => like = !like" />
            </div>
          </div>
          <el-divider />
          <div class="video__user-upload">
            <el-avatar>{{
              getUsernameInitial(data.object?.uploadedBy?.name ?? 'A')
            }}</el-avatar>
            <div>
              <p class="video__user-name">{{ data.object?.uploadedBy?.name ?? 'Admin' }}</p>
              <p class="video__subscribe-number">0 subscriber</p>
            </div>
            <div class="video__user-subscribe">
              <el-button type="primary" size="large" round>Subscribe</el-button>
            </div>
          </div>

          <span v-if="!showMore" class="video-description">
            <span v-html="_.truncate(data.object.metadata?.video_description, { length: 200 })" />
            <span role="button" v-show="data.object.metadata?.video_description?.length > 200" @click="showMore = true"
              class="button__view-more">View more</span>
          </span>
          <span v-else class="video-description">
            <span v-html="data.object.metadata?.video_description" />
            <span class="button__view-more" role="button" @click="showMore = false">&nbsp; View less</span>
          </span>
          <Comments :comments="[]" :video-id="data.object.id" />
        </div>
      </div>

      <el-result v-else-if="error" title="404" sub-title="Sorry, request error">
        <template #icon>
          <el-image :src="defaultThumbnailVideo" />
        </template>
        <template #extra>
          <el-button type="primary" @click="router.back()">Back</el-button>
        </template>
      </el-result>
    </el-col>
    <el-col :span="8" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
      <div v-if="relatedVideos" class="video-item" v-for="video in relatedVideos?.objects" :key="video.id">
        <router-link :to="{ name: 'Video', params: { id: video.id } }">
          <el-image class="video-thumbnail__image" :src="video.thumbnail" :alt="video.title">
            <template #placeholder>
              <img class="video-thumbnail__image" :src="defaultThumbnailVideo" alt="" />
            </template>
            <template #error>
              <div class="image-slot">
                <el-icon :size="24">
                  <svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"></path>
                  </svg>
                </el-icon>
              </div>
            </template>
          </el-image>
        </router-link>
        <div class="video-thumbnail__content">
          <span class="video-thumbnail__title">{{ video.title }}</span>
          <div class="el-link el-link--info video-info video-thumbnail__description">
            <p>{{ 'Admin' }}</p>
            <span>{{ 0 }} views</span>
          </div>
        </div>
      </div>
      <el-skeleton :loading="relatedLoading" v-for="skeletonItem in 10" :key="skeletonItem" class="video-skeleton__wrapper"
        :animated="true">
        <template #template>
          <el-skeleton-item variant="image" class="video-skeleton__image" />
          <div class="video-skeleton__description">
            <el-skeleton-item variant="p" style="width: 100%" />
            <el-skeleton-item variant="p" style="width: 30%" />
            <el-skeleton-item variant="p" style="width: 60%" />
          </div>
        </template>
      </el-skeleton>
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
  white-space: pre-wrap;
}

.video-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.video-thumbnail__content {
  margin-left: 1rem;
}

.video-thumbnail__title {
  font-size: 14px;
  -webkit-line-clamp: 3;
  overflow-wrap: break-word;
  line-height: 1.25rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.video-thumbnail__description {
  font-size: 12px;
}

.video-thumbnail__description>p {
  margin-block-start: 0.5rem;
  margin-block-end: 0.5rem;
}

.video-thumbnail__image {
  height: 6.25rem;
  width: 10.75rem;
  border-radius: 0.25rem;
}
</style>
