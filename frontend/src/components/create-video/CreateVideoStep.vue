<template>
  <el-steps :active="active" finish-status="success">
    <el-step title="Upload Video" :icon="Upload" />
    <el-step title="Title" :icon="Edit" />
    <el-step title="Thumbnail" :icon="Picture" />
  </el-steps>

  <div v-if="active === 0">
    <el-upload
      class="upload-demo"
      drag
      :action="uploadVideoUrl"
      :multiple="false"
      :on-success="getUploadedVideo"
      accept="video/*">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          mp4/mov files with a size less than 500mb
        </div>
      </template>
    </el-upload>
  </div>
  <div v-if="active === 1">
    <el-form
      label-position="top"
      :model="formdata"
      label-width="120px"
      :rules="rules"
      ref="formRef">
      <el-form-item label="Title" prop="title">
        <el-input v-model="formdata.title" type="text" />
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input v-model="formdata.description" type="textarea" />
      </el-form-item>
    </el-form>
    <!-- <VideoPlayer
      v-if="formdata.filePath"
      :src="getVideoPath(formdata.filePath)"
      :autoPlay="false" /> -->
    <video
      id="videoPlayer"
      controls
      muted="true"
      :autoplay="false"
      ref="refVideo">
      <source
        v-if="videoState.tmpFile"
        :src="`${backendUrl}/api/video/tmpfile/${videoState.tmpFile}`"
        type="video/mp4" />
    </video>
  </div>

  <div v-if="active === 2">
    <span style="margin: 4px">Choose thumbnail:</span>
    <el-upload
      v-model:file-list="thumbnailList"
      :action="uploadThumbnailUrl"
      list-type="picture-card"
      :auto-upload="false"
      :multiple="false"
      :on-success="getUploadedImage"
      :on-error="showErrorMsg"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      accept="image/*">
      <el-icon><Plus /></el-icon>
    </el-upload>

    <el-dialog v-model="dialogVisible">
      <el-image w-full :src="dialogImageUrl" fit="cover" alt="Preview Image" />
    </el-dialog>

    <el-radio-group v-model="formdata.thumbnail" class="ml-4">
      <el-radio
        v-for="item in thumbnailList"
        :key="item.url"
        :label="item.name"
        size="large"
        >{{ item.name }}</el-radio
      >
    </el-radio-group>
  </div>

  <div v-if="active === 3">
    <el-result
      icon="success"
      title="Upload Video Success"
      sub-title="Please follow the instructions">
      <template #extra>
        <el-button type="primary">Close</el-button>
      </template>
    </el-result>
  </div>

  <div class="navigate" style="margin-top: 12px">
    <el-button @click="previous">Back step</el-button>
    <el-button v-if="active < 3" :type="buttonType" @click="next">{{
      active === 2 ? "Upload" : "Next step"
    }}</el-button>
  </div>
  <code>Step: {{ active }}</code>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUpdated, watch, computed, Ref } from "vue";
import {
  Edit,
  Picture,
  Upload,
  UploadFilled,
  Delete,
  Download,
  Plus,
  ZoomIn,
} from "@element-plus/icons-vue";
import {
  FormInstance,
  FormRules,
  ElNotification,
  UploadProps,
  UploadUserFile,
} from "element-plus";
import type { UploadFile, UploadFiles } from "element-plus";
import VideoPlayer from "@/components/video-player/index.vue";
import {
  uploadVideoUrl,
  uploadThumbnailUrl,
  getVideoPath,
  backendUrl,
} from "@/services/api";
import { createVideoMutation } from "@/services/graphql";
import { useMutation } from "villus";
import _ from "lodash-es";
import { useStorage } from "@vueuse/core";
import { useUploadVideoStore } from "@/stores/uploadVideo";
import { useUserStore } from "@/stores/user";
import {
  getTmpVideo,
  postGenerateThumbnail,
  getDurationVideo,
} from "@/services/request";

const { uploadVideo: formdata, getVideo, setVideo } = useUploadVideoStore();
const userStore = useUserStore();
const refVideo: Ref<HTMLMediaElement | null> = ref(null);
const active = ref(0);
const formRef = ref<FormInstance>();
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const disabled = ref(false);
const videoState = useStorage("video-file", { tmpFile: "", tmpThumbnail: "" });
const buttonType = computed(() => (active.value === 2 ? "primary" : ""));

const thumbnailList = ref<UploadUserFile[]>([]);

// const isValidVideo = async (videoPath: string) => {
//   if (_.isEmpty(videoPath)) return false;
//   try {
//     const res = await getTmpVideo(videoPath);
//     if (res.status === 200) return true;
//   } catch (error) {
//     throw error;
//   }
//   return false;
// };

// const formdata = reactive({
//   title: "Test video",
//   description: "Test description",
//   uploadedBy: "63ca3f3b266d3eb2d9def1ca",
//   duration: "238.886867",
//   thumbnail: "tree-7391504_1920.jpg",
//   filePath:
//     "00bc1ee9-53d4-4d75-a784-79c97727a97e/00bc1ee9-53d4-4d75-a784-79c97727a97e.m3u8",
//   // privacy: 1, // 1 - Public; 2 - Individual;
//   // category: null,
// });

const { data, execute, isDone, isFetching } = useMutation(createVideoMutation);

watch(active, async (newValue) => {
  // console.log("[watch] active", newValue);
  if (newValue === 2 && !_.isEmpty(videoState.value.tmpFile)) {
    if (_.isEmpty(videoState.value.tmpThumbnail)) {
      const { data } = await postGenerateThumbnail(videoState.value.tmpFile);
      videoState.value.tmpThumbnail = data.filename;
    }
    thumbnailList.value.push({
      name: videoState.value.tmpThumbnail,
      url: backendUrl + "/image/" + videoState.value.tmpThumbnail,
    });
  }
});

onMounted(() => {
  if (_.isEmpty(formdata.uploadedBy)) {
    formdata.uploadedBy = userStore.id;
  }
});

onUpdated(() => {
  if (_.isEmpty(formdata.uploadedBy)) {
    formdata.uploadedBy = userStore.id;
  }

  refVideo.value?.addEventListener("loadedmetadata", (event) => {
    const target = event.target as HTMLMediaElement;
    formdata.duration = `${target.duration}`;
  });
});

const getUploadedVideo = (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  console.log(response, uploadFile, uploadFiles);
  formdata.filePath = response.filePath;
  videoState.value.tmpFile = response.tmpFile;
};

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
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
});

const getUploadedImage = (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  console.log("[info] response thumbnail", response);

  videoState.value.tmpThumbnail = response.originalname;
  formdata.thumbnail = response.originalname;
};

const handleRemove: UploadProps["onRemove"] = (file: UploadFile) => {
  console.log(file);
};

const handlePictureCardPreview: UploadProps["onPreview"] = (
  file: UploadFile
) => {
  dialogImageUrl.value = file.url!;
  dialogVisible.value = true;
};

const handleDownload = (file: UploadFile) => {
  console.log(file);
};

const showNotification = (
  message: string,
  title: string,
  type: any = "success"
) => {
  ElNotification({
    title: title,
    message: message,
    type: type,
  });
};

const showErrorMsg: UploadProps["onError"] = (
  error: Error,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  showNotification(error.cause + " " + uploadFile.name, "Error", "error");
};

const handleSaveVideo = () => {
  console.log("[submited] submited to save");
  showNotification("Save video success", "Success");

  // ==== Video Info ====
  // - title
  // - description
  // - uploadedBy
  // - duration
  // - thumbnail
  // - filePath
  // - privacy
  // - category
  formdata.privacy = 0;

  execute({ videoInput: formdata });

  console.log("[info] form data", formdata);
};

const next = () => {
  if (active.value++ > 2) active.value = 0;
  //Handle when press upload button
  if (active.value === 3) {
    handleSaveVideo();
  }
};

const previous = () => {
  if (active.value-- < 1) active.value = 0;
};
</script>

<style scoped>
.navigate {
  display: flex;
  justify-content: space-between;
}
#videoPlayer {
  object-fit: cover;
  height: 100%;
  max-width: 100%;
}
</style>
