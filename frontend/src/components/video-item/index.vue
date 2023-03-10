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
      <img
        class=""
        width="280"
        :src="
          props.video.thumbnail
            ? `${backendUrl}/image/${props.video.thumbnail}`
            : '/src/assets/thumbnail-placeholder.webp'
        "
        alt="" />
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
          class="el-link el-link--info"
          ><b>{{ props.video.uploadedBy.name }}</b></router-link
        >
        <div class="video-metadata el-link el-link--info">
          <span>{{ props.video.views }} views</span>
          •
          <span>{{ dayjs(+props.video.createdAt).fromNow() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
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
}
.el-link {
  justify-content: flex-start;
}
</style>
