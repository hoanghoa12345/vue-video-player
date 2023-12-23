<script lang="ts" setup>
import { UploadFilled, Upload } from "@element-plus/icons-vue";
import { FormInstance, ElMessage, FormRules } from "element-plus";
import { useMutation, useQuery } from "villus";
import { reactive, ref, watch } from "vue";
import _ from "lodash-es";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { backendUrl } from "@/services/api";
import { Video } from "@/utils/types";
import EditVideoDialog from '@/components/video-dialogs/EditVideoDialog.vue'
dayjs.extend(duration);
const dialogVisible = ref(false);
const editVideoModal = ref<boolean>(false);
const videoData = ref<Video>();
const formRef = ref<FormInstance>();
const form = reactive({
  title: "",
  description: "",
  videoSource: "",
  thumbnail: "",
  duration: "",
});

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

const CreateVideo = `
mutation createVideo($video: VideoInput) {
  createVideo(video: $video) {
    _id
    title
    description
    videoSource
    duration
    createdAt
    thumbnail
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

const { execute, isFetching: isFetchingForm } = useMutation(CreateVideo);

const handleClose = (done: () => void) => {
  done();
};

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
      console.log(form);
      execute({ video: form }).then((result) => {
        if (result.data) {
          ElMessage.success("Upload video successfull");
        }
        if (result.error) {
          ElMessage.error("Error when upload video");
        }
      });
      dialogVisible.value = false;
    } else {
      console.log("error submit!", fields);
    }
  });
};
const rules = reactive<FormRules>({
  title: [
    { required: true, message: "Please input title field", trigger: "blur" },
  ],
  description: [
    {
      required: true,
      message: "Please input description field",
      trigger: "blur",
    },
  ],
  videoSource: [
    {
      required: true,
      message: "Please input videoSource field",
      trigger: "blur",
    },
  ],
  thumbnail: [
    {
      required: true,
      message: "Please input thumbnail field",
      trigger: "blur",
    },
  ],
  duration: [
    { required: true, message: "Please input duration field", trigger: "blur" },
  ],
});
const editVideo = (video: Video) => {
  // console.log(video.title);
  videoData.value = video;
  editVideoModal.value = true;
};
const closeEditDialog = () => {
  refetch()
}
</script>

<template>
  <div class="video-table__container">
    <button type="button" @click="dialogVisible = true">create</button>
    <div>
      <el-row :gutter="20" v-loading="isFetching">
        <el-col v-for="video in data?.videos" :key="video._id" :xl="4" :lg="4" :md="6" :sm="10" :xs="12">
          <el-card class="video-table__card" :body-style="{ padding: '0px' }" shadow="hover">
            <img :src="`${backendUrl}/image/${video.thumbnail}`" class="image" />
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
        <el-result v-if="data?.videos.length === 0" icon="warning" title="Lỗi" sub-title="Not have video!"></el-result>
        <el-result v-if="error" icon="info" title="Error">
          <template #sub-title>
            <p>500 - Error when load data</p>
            <pre>{{ error }}</pre>
          </template>
          <template #extra>
            <el-button type="primary" @click="refetch({ cachePolicy: 'network-only' })">Try again!</el-button>
          </template>
        </el-result>
      </div>
      <el-dialog v-model="dialogVisible" title="Upload Video" :before-close="handleClose">
        <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
          <el-form-item label="Title" prop="title">
            <el-input v-model="form.title" type="text" />
          </el-form-item>
          <el-form-item label="Description" prop="description">
            <el-input v-model="form.description" type="textarea" />
          </el-form-item>
          <el-form-item label="Video source" prop="videoSource">
            <el-input v-model="form.videoSource" type="text" />
          </el-form-item>
          <el-form-item label="Duration" prop="duration">
            <el-input v-model="form.duration" type="text" />
          </el-form-item>
          <el-form-item label="Thumbnail" prop="thumbnail">
            <el-input v-model="form.thumbnail" type="text" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="onSubmit(formRef)" :loading="isFetchingForm">
              Upload<el-icon class="el-icon--right">
                <Upload />
              </el-icon>
            </el-button>
          </span>
        </template>
      </el-dialog>
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









