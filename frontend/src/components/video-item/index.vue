<script lang="ts">
export default {
  name: "VideoItem",
  inheritAttrs: false,
};
</script>
<script setup lang="ts">
import { UserFilled } from "@element-plus/icons-vue";
import _ from "lodash-es";
import { Video } from "@/utils/types";
import { backendUrl } from "@/services/api";
import defaultImage from "@/assets/video-placeholder.webp";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";

dayjs.locale("en");
dayjs.extend(relativeTime);

const props = defineProps<{ video: Video }>();
</script>
<template>
  <div class="video-container">
    <router-link
      :to="'/video/' + props.video._id"
      class="thumbnail"
      :aria-label="props.video.title"
      :title="props.video.title">
      <el-image
        class="thumbnail__image"
        :src="`${backendUrl}/image/${props.video.thumbnail}`"
        :alt="props.video.title">
        <template #placeholder>
          <img class="thumbnail__image" :src="defaultImage" alt="" />
        </template>
      </el-image>
    </router-link>
    <div class="video-bottom-section">
      <router-link :to="`/channel/${props.video.uploadedBy._id}`">
        <el-avatar :icon="UserFilled" />
      </router-link>
      <div class="video-details">
        <router-link
          type="primary"
          :to="'/video/' + props.video._id"
          class="el-link el-link--primary link-title">
          {{ props.video.title }}
        </router-link>
        <router-link
          type="info"
          :to="`/channel/${props.video.uploadedBy._id}`"
          class="el-link el-link--info video-item__channel-name"
          ><span>{{ props.video.uploadedBy.name }}</span></router-link
        >
        <div class="video-metadata el-link el-link--info">
          <span>{{ props.video.views }} views</span>
          &nbsp; • &nbsp;
          <span>{{ dayjs(+props.video.createdAt).fromNow() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.thumbnail {
  display: flex;
  justify-content: center;
  width: 100%;
}
.thumbnail__image {
  width: 100%;
  border-radius: 0.375rem;
  min-height: 10rem;
}
img.placeholder {
  -webkit-filter: grayscale(100%);
  filter: grayscale(100%);
  opacity: 0.8;
}
.video-bottom-section {
  display: flex;
  align-items: flex-start;
  margin-top: 1rem;
}
.video-details {
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
}
.video-details > a {
  line-height: 1.4;
}
.link-title {
  font-weight: bold;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
  height: 2.6rem;
  text-overflow: ellipsis;
  color: var(--el-text-color-primary);
  font-weight: 600;
}
.el-link {
  justify-content: flex-start;
}
.video-item__channel-name {
  font-weight: 500;
  font-size: 12px;
  text-transform: capitalize;
}
.video-metadata {
  font-size: 12px;
}
</style>
