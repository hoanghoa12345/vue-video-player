import { CreateVideo } from "@/services/graphql";
import { ElLoading, ElMessage, FormInstance, FormRules } from "element-plus";
import { useMutation } from "villus";
import { reactive, ref } from "vue";
// import Hls from "hls.js";

// const UUIDv4Regex =
//   /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const ObjectIdRegex = /^[0-9a-fA-F]{24}$/;

export const useCreateVideo = () => {
  const formRef = ref<FormInstance>();
  // const videoRef = ref<HTMLVideoElement>();
  const form = reactive({
    title: "",
    description: "",
    filePath: "",
    duration: "",
    rawDuration: 0,
    thumbnail: "",
    uploadedBy: "",
    privacy: 1,
  });

  const { execute, isFetching: isFetchingForm } = useMutation(CreateVideo);

  const handleClose = (done: () => void) => {
    done();
  };

  function durationToSeconds(duration: string) {
    const [minutes, seconds] = duration.split(":");
    return parseInt(minutes) * 60 + parseInt(seconds);
  }

  const onSubmit = async (
    formEl: FormInstance | undefined,
    done: () => void
  ) => {
    if (!formEl) return;
    await formEl.validate((valid, fields) => {
      if (valid) {
        if (ObjectIdRegex.test(form.uploadedBy) === false) {
          ElMessage.error("Upload user not valid");
          return;
        }

        if (form.rawDuration === 0) {
          form.rawDuration = durationToSeconds(form.duration);
        }
        execute({
          video: {
            title: form.title,
            description: form.description,
            filePath: form.filePath,
            duration: form.rawDuration.toFixed(2),
            thumbnail: form.thumbnail,
            uploadedBy: form.uploadedBy,
            privacy: form.privacy,
          },
        }).then(({ data, error }) => {
          if (error) {
            ElMessage.error("Error when upload video: " + error.message);
          } else {
            ElMessage.success("Create video successful");
            done();
          }
        });
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
    filePath: [
      {
        required: true,
        message: "Please input video URL field",
        trigger: "blur",
      },
      {
        validator: (rule, value, callback) => {
          if (/^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(value) === false) {
            callback(new Error("Please input correct video URL field"));
          } else {
            callback();
          }
        },
        message: "Video URL must be contain link to video",
        trigger: "blur",
      },
    ],
    thumbnail: [
      {
        required: true,
        message: "Please input thumbnail field",
        trigger: "blur",
      },
      {
        validator: (rule, value, callback) => {
          if (/^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(value) === false) {
            callback(new Error("Please input thumbnail field"));
          } else {
            callback();
          }
        },
        message: "Please input correct thumbnail URL field",
        trigger: "blur",
      },
    ],
    duration: [
      {
        required: true,
        message: "Please input duration field",
        trigger: "blur",
      },
      {
        validator: (rule, value, callback) => {
          const durationRegex = /^([0-9]{1,2}):([0-9]{2})$/;
          if (durationRegex.test(value) === false) {
            callback(new Error("Please input duration field"));
          } else {
            callback();
          }
        },
        message: "Please input correct format of the video's mm:ss",
        trigger: "blur",
      },
    ],
  });

  const secondsToMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toFixed(0)}`;
  };

  /*  const fetchVideoInfo = () => {
      const loading = ElLoading.service({
        lock: true,
        text: "Loading",
        background: "rgba(0, 0, 0, 0.7)",
        target:
          (document.querySelector("#form-create-video") as HTMLElement) ||
          document.querySelector("body"),
      });
      if (videoRef.value) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(form.filePath);
          hls.attachMedia(videoRef.value);
        } else if (videoRef.value.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.value.src = form.filePath;
        }
        videoRef.value.addEventListener(
          "loadedmetadata",
          function (event: Event) {
            const videoEl = event.target as HTMLVideoElement;
            const duration = videoEl.duration;
            form.duration = secondsToMinutes(duration);
            form.rawDuration = duration;
            loading.close();
          }
        );
        // Check videoRef load video is error
        videoRef.value.addEventListener("error", function (event: Event) {
          ElMessage.error("Error when load video");
          loading.close();
        });
      }
    };*/

  return {
    form,
    formRef,
    rules,
    onSubmit,
    handleClose,
    isFetchingForm,
    // videoRef,
    // fetchVideoInfo,
  };
};
