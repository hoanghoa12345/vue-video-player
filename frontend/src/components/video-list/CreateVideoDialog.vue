<template>
  <el-dialog
    :model-value="props.modelValue"
    @update:model-value="emit('update:modelValue', false)"
    title="Create Video"
    :before-close="handleClose"
    :close-on-click-modal="false"
    id="form-create-video">
    <el-form
      :model="form"
      label-width="120px"
      :rules="rules"
      ref="formRef"
      label-position="top"
      size="default"
      hide-required-asterisk>
      <el-form-item label="Title" prop="title">
        <el-input
          v-model="form.title"
          type="text"
          minlength="10"
          maxlength="255"
          show-word-limit
          clearable
          placeholder="Enter title of video" />
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 8 }"
          placeholder="Enter description of video"
          minlength="50"
          maxlength="700"
          show-word-limit
          clearable />
      </el-form-item>
      <el-form-item label="Video URL" prop="filePath">
        <el-input
          v-model="form.filePath"
          type="text"
          placeholder="Paste video URL"
          :prefix-icon="Link" />
      </el-form-item>
      <video class="video-create__preview--small" ref="videoRef" controls style="display: none;" />
      <el-form-item label="Duration" prop="duration">
        <el-input
          v-model="form.duration"
          placeholder="Choose video duration"
          :prefix-icon="Clock" />
      </el-form-item>
      <el-form-item label="Thumbnail" prop="thumbnail">
        <el-input
          v-model="form.thumbnail"
          type="text"
          placeholder="Paste thumbnail of video"
          :prefix-icon="DocumentAdd" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emit('update:modelValue', false)">Cancel</el-button>
        <el-button
          type="primary"
          @click="onSubmit(formRef, () => emit('update:modelValue', false))"
          :loading="isFetchingForm">
          Create
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Clock, DocumentAdd, Link } from "@element-plus/icons-vue";
import { UPDATE_MODEL_EVENT } from "element-plus";
import { isBoolean } from "lodash-es";
import { useCreateVideo } from "@/composables/useCreateVideo";
import { onMounted, watch } from "vue";
import { useUserStore } from "@/stores/user";

const {
  form,
  formRef,
  rules,
  onSubmit,
  handleClose,
  isFetchingForm,
  videoRef,
  fetchVideoInfo,
} = useCreateVideo();

const userStore = useUserStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits({
  [UPDATE_MODEL_EVENT]: (value: boolean) => isBoolean(value),
});

const setUploadUser = () => {
  form.uploadedBy = userStore.id;
};

onMounted(() => {
  setUploadUser();
});

watch(
  () => form.filePath,
  () => {
    fetchVideoInfo();
  }
);
</script>
