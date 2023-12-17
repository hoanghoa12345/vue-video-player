import { defineStore } from "pinia";
import { ref, watch } from "vue";

type VideoData = {
  title: string;
  description: string;
  uploadedBy: string;
  duration: string;
  thumbnail: string;
  filePath: string;
  privacy: number;
};

const STORE_KEY = "upload-video";

export const useUploadVideoStore = defineStore(STORE_KEY, () => {
  const uploadVideo = ref({
    title: "",
    description: "",
    uploadedBy: "",
    duration: "",
    thumbnail: "",
    filePath: "",
    privacy: 0,
  });

  if (localStorage.getItem(STORE_KEY)) {
    uploadVideo.value = JSON.parse(localStorage.getItem(STORE_KEY)!);
  }

  watch(
    () => uploadVideo,
    (uploadVideoVal) => {
      localStorage.setItem(STORE_KEY, JSON.stringify(uploadVideoVal.value));
    },
    { deep: true }
  );

  function setVideo(video: VideoData): void {
    uploadVideo.value = video;
  }

  function getVideo(): VideoData {
    return uploadVideo.value;
  }

  return { uploadVideo, setVideo, getVideo };
});
