<script lang="ts" setup>
import { useQuery } from "villus";
import { ref } from "vue";
import _ from "lodash-es";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Video } from "@/utils/types";
import EditVideoDialog from '@/components/video-dialogs/EditVideoDialog.vue'
import CreateVideoDialog from "./CreateVideoDialog.vue";
import defaultImage from "@/assets/video-placeholder.webp";
dayjs.extend(duration);

const dialogVisible = ref(false);
const editVideoModal = ref<boolean>(false);
const videoData = ref<Video>();

const AllVideos = `
  query AllVideos {
    videos {
      _id
      title
      description
      filePath
      thumbnail
      duration
      privacy
      createdAt
      views
    }
  }
`;

const {
  data,
  isFetching,
  error,
  execute: refetch,
} = useQuery({
  query: AllVideos,
});


const editVideo = (video: Video) => {
  // console.log(video.title);
  videoData.value = video;
  editVideoModal.value = true;
};
const closeEditDialog = () => {
  refetch()
}

const handleError = (event: Event) => {
  if (event.target instanceof HTMLImageElement) {
    event.target.src = defaultImage;
  }
}
</script>

<template>
  <div class="video-table__container">
    <el-button type="primary" class="video-table__create-button" @click="dialogVisible = true">Create</el-button>
    <div>
      <el-row :gutter="20" v-loading="isFetching">
        <el-col v-for="video in data?.videos" :key="video._id" :xl="4" :lg="4" :md="6" :sm="10" :xs="12">
          <el-card class="video-table__card" :body-style="{ padding: '0px' }" shadow="hover">
            <img :src="video.thumbnail" class="image" @error="handleError" />
            <div style="padding: 14px">
              <span class="video-table__title">{{ video.title }}</span>
              <div class="bottom clearfix">
                <time class="time">{{
                  dayjs.duration(video.duration * 1000).format("mm:ss")
                }}</time>
                <el-link type="primary" class="edit-button" :underline="false" @click="editVideo(video)">Edit</el-link>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <div>
        <el-result v-if="data?.videos.length === 0" icon="warning" title="Error" sub-title="Not have video!"></el-result>
        <el-result v-if="error" icon="info" title="Error">
          <template #sub-title>
            <p :aria-errormessage="error.message">500 - Error when load data</p>
          </template>
          <template #extra>
            <el-button type="primary" @click="refetch({ cachePolicy: 'network-only' })">Try again!</el-button>
          </template>
        </el-result>
      </div>
      <CreateVideoDialog v-model="dialogVisible" />
      <EditVideoDialog v-model="editVideoModal" :videoData="videoData" @close="closeEditDialog" />
    </div>
  </div>
</template>
<style scoped>
.image {
  width: 100%;
  display: block;
}

.time {
  font-size: 13px;
  color: #999;
}

.edit-button {
  padding: 0;
  float: right;
}
</style>
















