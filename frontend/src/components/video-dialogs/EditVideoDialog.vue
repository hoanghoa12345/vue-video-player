<template>
  <el-dialog :title="videoData?.title" :model-value="modelValue" @update:modelValue="emit('update:modelValue', false)"
    :draggable="true" width="80%" @close="emit('close')">
    <el-tabs tab-position="left" type="border-card" class="video-edit__tabs" v-model="currentTab" @tab-change="changeTab" ref="tabEditRef">
      <el-tab-pane label="Title" :name="TAB_EDIT_TITLE">
        <el-scrollbar :height="scrollHeight">
          <p class="video-table__title">Title</p>
          <div>
            <el-form label-position="top" :model="formEditData" label-width="120px" :rules="rulesEdit" ref="formEditRef">
              <el-form-item label="Title" prop="title">
                <el-input v-model="formEditData.title" type="text" />
              </el-form-item>
              <el-form-item label="Description" prop="description">
                <el-input v-model="formEditData.description" type="textarea" :autosize="{ minRows: 8, maxRows: 12 }" />
              </el-form-item>
              <el-form-item label="Video URL" prop="filePath">
                <el-input v-model="formEditData.filePath" type="text" />
              </el-form-item>
              <el-form-item label="Thumbnail URL" prop="thumbnail">
                <el-input v-model="formEditData.thumbnail" type="text" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSubmitEdit(formEditRef)">Save</el-button>
                <el-button @click="emit('update:modelValue', false)">Cancel</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="Video" :name="TAB_EDIT_VIDEO">
        <p class="video-table__title">Video</p>
        <p>{{ formEditData.filePath }}</p>
      </el-tab-pane>
      <el-tab-pane label="Visible" :name="TAB_EDIT_PRIVACY">
        <p class="video-table__title">Visible</p>
        <div class="video-dialog__radio-wrapper">
          <el-radio-group v-model="formEditData.privacy" class="ml-4 video-dialog__radio-group">
            <el-radio :label="1" size="large">Public</el-radio>
            <el-radio :label="2" size="large">Follower</el-radio>
            <el-radio :label="3" size="large">Just me</el-radio>
          </el-radio-group>
          <el-button type="primary" class="radio-group__button--end" @click="updatePrivacy">Update</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Thumbnail" :name="TAB_EDIT_THUMB">
        <el-scrollbar :height="scrollHeight">
          <p class="video-table__title">Thumbnail</p>
          <div class="video-edit__thumbnail-preview">
            <div class="video-edit__video-preview">
              <div class="video-player__wrapper">
                <video-player ref="videoRef" v-if="videoData?.filePath" :src="videoData?.filePath" :auto-play="false" />
              </div>
              <canvas ref="Canvas" id="myCanvas" style="display: none"></canvas>
              <p>Generate new thumbnail:</p>
              <el-button @click="generateNewThumbnail">Generate</el-button>
            </div>
            <div class="video-edit__image-thumbnail">
              <el-image class="video-edit__image-inner" :src="`${videoData?.thumbnail}`" fit="contain" />
            </div>
          </div>
          <div class="video-dialog__thumbnail-wrapper">
            <span class="step-thumbnail__label-text">Choose thumbnail:</span>
            <div class="video-dialog__upload-thumbnail">
              <el-upload class="step-thumbnail__upload" v-model:file-list="thumbnailList" :action="uploadThumbnailUrl"
                list-type="picture-card" :auto-upload="false" :multiple="false" :on-success="getUploadedImage"
                :on-error="showErrorMsg" :on-preview="handlePictureCardPreview" accept="image/*">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-upload>

              <el-dialog v-model="dialogVisible">
                <el-image w-full :src="dialogImageUrl" fit="cover" alt="Preview Image" />
              </el-dialog>

              <el-radio-group v-model="formEditData.thumbnail" class="ml-4">
                <el-radio v-for="item in thumbnailList" :key="item.url" :label="item.name" size="large">{{ item.name
                }}</el-radio>
              </el-radio-group>
            </div>
          </div>
          <el-button type="primary" @click="updateThumbnail">Update</el-button>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  TAB_EDIT_TITLE,
  TAB_EDIT_VIDEO,
  TAB_EDIT_PRIVACY,
  TAB_EDIT_THUMB,
  useEditVideoDialog,
} from "@/composables/useEditVideoDialog";
import { isBoolean } from "lodash";
import { backendUrl, getVideoPath, uploadThumbnailUrl } from "@/services/api";
import { Video } from "@/utils/types";
import { UPDATE_MODEL_EVENT } from "element-plus";
import { PropType, onUpdated, watch } from "vue";
import VideoPlayer from "@/components/video-player/index.vue";
import { Plus } from "@element-plus/icons-vue";

const props = defineProps({
  /**
   * @description visibility of Dialog
   */
  modelValue: Boolean,
  videoData: Object as PropType<Video>,
});

const emit = defineEmits({
  [UPDATE_MODEL_EVENT]: (value: boolean) => isBoolean(value),
  close: () => true,
});

const {
  onSubmit: onSubmitEdit,
  rules: rulesEdit,
  formRef: formEditRef,
  formData: formEditData,
  videoId,
  updatePrivacy,
  changeTab,
  thumbnailList,
  getUploadedImage,
  showErrorMsg,
  handlePictureCardPreview,
  dialogVisible,
  dialogImageUrl,
  currentTab,
  generateNewThumbnail,
  videoRef,
  Canvas,
  updateThumbnail,
  scrollHeight,
  tabEditRef,
} = useEditVideoDialog();

onUpdated(() => {
  videoId.value = props.videoData?._id;
  formEditData.title = props.videoData?.title ?? "";
  formEditData.description = props.videoData?.description ?? "";
  formEditData.filePath = props.videoData?.filePath ?? "";
  formEditData.thumbnail = props.videoData?.thumbnail ?? "";
  formEditData.duration = props.videoData?.duration ?? "";
  formEditData.uploadedBy = "no user";
  formEditData.privacy = props.videoData?.privacy ?? 0;
  if (props.videoData) {
    thumbnailList.value = new Array();
    thumbnailList.value.push({
      name: props.videoData.title,
      url: props.videoData.thumbnail,
    });
  }
});

</script>


