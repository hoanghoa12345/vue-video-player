import {
  ElMessage,
  ElNotification,
  FormInstance,
  FormRules,
  TabPaneName,
  UploadFile,
  UploadFiles,
  UploadProps,
  UploadUserFile,
} from "element-plus";
import { Ref, defineAsyncComponent, reactive, ref } from "vue";
import { Video, VideoInput } from "@/utils/types";
import { useMutation } from "villus";
import { UpdateVideo } from "@/services/graphql";
import { backendUrl, uploadThumbnailUrl } from "@/services/api";
import axios from "axios";

interface HTMLVideoElementWithRef extends HTMLVideoElement {
  refVideo: HTMLVideoElement;
}

export const TAB_EDIT_TITLE = "editVideoTitle";
export const TAB_EDIT_VIDEO = "editVideoFile";
export const TAB_EDIT_PRIVACY = "editVideoPrivacy";
export const TAB_EDIT_THUMB = "editVideoThumbnail";

export function useEditVideoDialog() {
  const formRef = ref<FormInstance>();
  const videoId = ref<string>();
  const formData = reactive<VideoInput>({
    title: "",
    description: "",
    filePath: "",
    thumbnail: "",
    duration: "",
    uploadedBy: "",
    privacy: 0,
  });
  // Upload thumbnail
  const thumbnailList = ref<UploadUserFile[]>([]);
  const dialogImageUrl = ref("");
  const dialogVisible = ref(false);
  const currentTab = ref<TabPaneName>(TAB_EDIT_TITLE);
  const videoRef = ref<HTMLElement | null>();
  const Canvas = ref<HTMLCanvasElement | null>();
  const blobImages = ref<Blob[]>([]);

  const { data, execute, isDone, isFetching } = useMutation(UpdateVideo);

  const onSubmit = async (formEl: FormInstance | undefined) => {
    console.log(formEl);

    if (!formEl) return;
    await formEl.validate((valid, fields) => {
      if (valid) {
        console.log("submit!");
        execute({
          id: videoId.value,
          video: formData,
        }).then(({ data, error }: any) => {
          if (!error) {
            ElMessage.success("Video updated successfully");
          } else {
            ElMessage.error(error.message);
          }
        });
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

  const updatePrivacy = () => {
    if (Number(formData.privacy) > 0) {
      execute({
        id: videoId.value,
        video: formData,
      }).then(({ data, error }: any) => {
        if (!error) {
          ElMessage.success("Video updated successfully");
        } else {
          ElMessage.error(error.message);
        }
      });
    }
  };

  const changeTab = (name: TabPaneName) => {
    currentTab.value = name;
  };

  const getUploadedImage = (
    response: any,
    uploadFile: UploadFile,
    uploadFiles: UploadFiles
  ) => {
    console.log("[info] response thumbnail", response);

    formData.thumbnail = response.originalname;
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

  const handlePictureCardPreview: UploadProps["onPreview"] = (
    file: UploadFile
  ) => {
    dialogImageUrl.value = file.url!;
    dialogVisible.value = true;
  };

  const generateNewThumbnail = async () => {
    if (videoRef.value) {
      const videoEl = (videoRef.value as HTMLVideoElementWithRef).refVideo;
      const ctx = Canvas.value?.getContext("2d");
      Canvas.value?.setAttribute("width", videoEl.videoWidth + "");
      Canvas.value?.setAttribute("height", videoEl.videoHeight + "");
      ctx?.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
      const blob = await new Promise((resolve) =>
        Canvas.value?.toBlob(resolve, "image/png")
      );
      const url = URL.createObjectURL(blob as Blob);
      console.log("thumbnail Url:", url);

      thumbnailList.value.push({
        name: `${videoId.value}.png`,
        url: url,
      });

      blobImages.value.push(blob as Blob);
    }
  };

  const updateThumbnail = async () => {
    console.log("formData.thumbnail: ", formData.thumbnail);
    const thumbnailSelected = thumbnailList.value.find(
      (item) => item.name === formData.thumbnail
    );
    console.log("thumbnailSelected: ", thumbnailSelected);
    if (thumbnailSelected?.url && thumbnailSelected.url.includes("blob")) {
      const blob = blobImages.value[0];
      console.log("Image blob:", blob);
      // Upload image
      const formImage = new FormData();
      formImage.append("file", blob, `${videoId.value}.png`);
      const { data } = await axios.post(uploadThumbnailUrl, formImage, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (data !== "Error") {
        console.log(data);
        showNotification(data.message, "Success");
      } else {
        showNotification(data.message, "Error");
        return;
      }
    }

    execute({
      id: videoId.value,
      video: formData,
    }).then(({ data, error }: any) => {
      if (!error) {
        ElMessage.success("Video updated successfully");
      } else {
        ElMessage.error(error.message);
      }
    });
  };

  return {
    onSubmit,
    rules,
    formRef,
    formData,
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
  };
}
