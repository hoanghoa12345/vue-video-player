<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  Ref,
  watch,
} from "vue";
import Hls from "hls.js";
import { debounce } from "lodash-es";
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  VolumeMutedIcon,
  VolumeUpIcon,
  SettingIcon,
  ExitFullscreenIcon,
  EnterFullscreenIcon,
} from "@/components/icons";
import { ElLoading } from 'element-plus'
import { LoadingInstance } from "element-plus/es/components/loading/src/loading";

type PlayerState = {
  loadStateType: string;
  playerProgress: number;
  currentTime: string;
  totalTime: string;
  fullScreen: boolean;
  playBtnState: "pause" | "play";
  preloadBar: number;
  muted: boolean;
  volume: number;
  isVideoHovering: boolean;
  isProgressHovering: boolean;
  isDraggingProgress: boolean;
  openSetting: boolean;
};

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  autoPlay: {
    type: Boolean,
    default: true,
  },
});

const refVideo: Ref<HTMLMediaElement | null> = ref(null);
const refPlayerWrap = ref<HTMLElement>();
const refProgress = ref<HTMLElement>();
let hls: Hls;
let loadingVideo: LoadingInstance;

const playerState = reactive<PlayerState>({
  loadStateType: "loadstart",
  playerProgress: 0,
  currentTime: "00:00",
  totalTime: "00:00",
  fullScreen: false,
  playBtnState: props.autoPlay ? "pause" : "play",
  preloadBar: 0,
  muted: false,
  volume: 1,
  isVideoHovering: false,
  isProgressHovering: false,
  isDraggingProgress: false,
  openSetting: false,
});

const init = () => {
  if (refVideo.value?.canPlayType("application/vnd.apple.mpegurl")) {
    refVideo.value.src = props.src;
    const promise = refVideo.value?.play();
    if (promise !== undefined) {
      promise
        .then((_) => {
          // console.log("Autoplay started!");
        })
        .catch((error) => {
          playerState.playBtnState = "play";
          // console.log("Autoplay was prevented", error);
        });
    }
  } else if (Hls.isSupported()) {
    hls = new Hls();

    hls.detachMedia();
    hls.attachMedia(refVideo.value!);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(props.src);
      // console.log("on attached");
      hls.on(Hls.Events.MANIFEST_PARSED, (ev, data) => {
        console.log(data);
        // console.log("auto play", props.autoPlay);

        if (props.autoPlay) {
          // Auto play video
          refVideo.value
            ?.play()
            .then((_) =>
              console.log(
                "%cVue.Player",
                "color:#caf0f8;padding:4px;background:#0077b6;border-radius:4px",
                "Autoplay started!"
              )
            )
            .catch(() => (playerState.playBtnState = "play"));
        }
      });
      hls.on(Hls.Events.LEVEL_SWITCHING, (ev, data) => {
        // console.log(data);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (ev, data) => {
        // console.log(data);
      });
    });
  }
  playerState.playerProgress = 0;
};
watch(
  () => props.src,
  () => {
    init();
  }
);
onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  if (hls) {
    hls.destroy();
  }
});

const timeFormat = (time: number) => {
  let mm: number | string = ~~(time / 60);
  let ss: number | string = ~~(time % 60);
  mm = mm < 10 ? "0" + mm : mm;
  ss = ss < 10 ? "0" + ss : ss;
  return `${mm}:${ss}`;
};

const onTimeUpdate = (event: Event) => {
  const videoElement = event.target as HTMLMediaElement;
  let duration = videoElement.duration || 0;
  let currentTime = videoElement.currentTime;
  playerState.playerProgress = currentTime / duration;
  playerState.currentTime = timeFormat(currentTime);
  playerState.totalTime = timeFormat(duration);
};

const onCanPlay = (event: Event) => {
  playerState.loadStateType = "canPlay"
  if(loadingVideo) {
    loadingVideo.close();
  }
  if (playerState.playBtnState !== "play") {
    if (refVideo.value) {
      refVideo.value.play();
    }
  }
  if (props.autoPlay) {
    if (refVideo.value) {
      refVideo.value.play();
    }
  }
};

const onEnded = () => {
  playerState.playerProgress = 0;
  playerState.playBtnState = "play";
};

const mutedPlay = () => {
  playerState.muted = !playerState.muted;
  if (playerState.muted) {
    playerState.volume = 0;
  } else {
    playerState.volume = 1;
  }
};

const progressChange = (event: Event, val: number) => {
  if (refVideo.value) {
    const duration = refVideo.value.duration;
    refVideo.value.currentTime = duration * val;
    if (playerState.playBtnState === "play") {
      refVideo.value.play();
      playerState.playBtnState = "pause";
    }
  }
};

const onProgress = (event: Event) => {
  const videoElement = event.target as HTMLMediaElement;
  const duration = videoElement.duration;
  const length = videoElement.buffered.length;
  const end =
    videoElement.buffered.length && videoElement.buffered.end(length - 1);
  playerState.preloadBar = end / duration;
};

const onLoadStart = (event: Event) => {
  playerState.loadStateType = "loadStart"
  loadingVideo = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
    target: refPlayerWrap.value,
  })
}

const togglePlay = () => {
  if (playerState.playBtnState === "play") {
    if (refVideo.value) {
      refVideo.value.play();
      playerState.playBtnState = "pause";
    }
  } else if (playerState.playBtnState === "pause") {
    if (refVideo.value) {
      refVideo.value.pause();
      playerState.playBtnState = "play";
    }
  }
};

const toggleFullScreen = () => {
  const el = refPlayerWrap.value as any;
  const isFullscreen = document.fullscreenElement;
  if (isFullscreen) {
    document.exitFullscreen().then(() => {
      playerState.fullScreen = false;
    });
  } else {
    if (el.webkitSupportsFullscreen) {
      el.webkitEnterFullscreen().then(() => {
        playerState.fullScreen = true;
        screen.orientation
          .lock("landscape")
          .catch((error) => console.log(error));
      });
    }
    if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen().then(() => {
        playerState.fullScreen = true;
        screen.orientation
          .lock("landscape")
          .catch((error) => console.log(error));
      });
    } else {
      el.requestFullscreen().then(() => {
        playerState.fullScreen = true;
        screen.orientation
          .lock("landscape")
          .catch((error) => console.log(error));
      });
    }
  }
};

const onPlay = () => {
  playerState.playBtnState = "pause";
};

const hideControl = debounce(() => {
  playerState.isVideoHovering = false;
  if (refVideo.value) refVideo.value.style.cursor = "none";
}, 1500);

const mouseMoveWarp = () => {
  if (refVideo.value) refVideo.value.style.cursor = "auto";
  playerState.isVideoHovering = true;
  if (!playerState.isProgressHovering) {
    hideControl();
  }
};

const mouseDownHandle = (event: MouseEvent) => {
  event.preventDefault();
  const refProgressEl = refProgress.value as HTMLElement;
  if (!playerState.isDraggingProgress) {
    const rect = refProgressEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const progress = x / width;
    playerState.playerProgress = progress;
    progressChange(event, progress);
  }

  playerState.isDraggingProgress = true;
  document.addEventListener("mousemove", mouseMoveHandle);
  document.addEventListener("mouseup", mouseUpHandle);
};

const mouseMoveHandle = (event: MouseEvent) => {
  const refProgressEl = refProgress.value as HTMLElement;
  if (playerState.isDraggingProgress) {
    const rect = refProgressEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const progress = x / width;
    playerState.playerProgress = progress;
    progressChange(event, progress);
  }
};
const mouseUpHandle = () => {
  playerState.isDraggingProgress = false;
  document.removeEventListener("mousemove", mouseMoveHandle);
  document.removeEventListener("mouseup", mouseUpHandle);
};

// Touch progress bar
const touchStartHandle = (event: TouchEvent) => {
  event.preventDefault();
  const refProgressEl = refProgress.value as HTMLElement;
  if (!playerState.isDraggingProgress) {
    const rect = refProgressEl.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const width = rect.width;
    const progress = x / width;
    playerState.playerProgress = progress;
    progressChange(event, progress);
  }

  playerState.isDraggingProgress = true;
  document.addEventListener("touchmove", touchMoveHandle);
  document.addEventListener("touchend", touchEndHandle);
};

const touchMoveHandle = (event: TouchEvent) => {
  const refProgressEl = refProgress.value as HTMLElement;
  if (playerState.isDraggingProgress) {
    const rect = refProgressEl.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const width = rect.width;
    const progress = x / width;
    playerState.playerProgress = progress;
    progressChange(event, progress);
  }
};

const touchEndHandle = () => {
  playerState.isDraggingProgress = false;
  document.removeEventListener("touchmove", touchMoveHandle);
  document.removeEventListener("touchend", touchEndHandle);
};

// Setting Menu
const openSettingMenu = () => {
  playerState.openSetting = !playerState.openSetting;
};

const loadProgressStyle = computed(() => {
  const value = (playerState.preloadBar * 100).toFixed(2);
  return `width: ${value}%`;
});

const playProgressStyle = computed(() => {
  const value = (playerState.playerProgress * 100).toFixed(2);
  return `width: ${value}%`;
});

const showPlayerControl = computed(() => {
  if (playerState.isVideoHovering) return true;
  if (playerState.playBtnState === "play") return true;
  return false;
});

defineExpose({
  refVideo,
});
</script>

<template>
  <div
    class="player-wrapper"
    :class="playerState.fullScreen ? 'player-wrapper__fullscreen' : null"
    ref="refPlayerWrap"
    @mousemove="mouseMoveWarp"
    @mouseleave="playerState.isVideoHovering = false">
    <div class="player__video">
      <video
        ref="refVideo"
        :muted="playerState.muted"
        :volume="playerState.volume"
        @play="onPlay"
        @timeupdate="onTimeUpdate"
        @canplay="onCanPlay"
        @ended="onEnded"
        @progress="onProgress"
        @loadstart="onLoadStart" />
      <div class="player__poster" @click="togglePlay"></div>
    </div>
    <Transition>
      <div class="player__big-play-button" v-if="playerState.playBtnState === 'play'">
        <button @click="togglePlay" class="player__button" title="Play">
          <el-icon :size="48" v-if="playerState.playBtnState === 'play'">
            <PlayIcon />
          </el-icon>
          <el-icon :size="48" v-else>
            <PauseIcon />
          </el-icon>
        </button>
      </div>
    </Transition>

    <Transition>
      <div class="player-controls" v-show="showPlayerControl">
        <div
          ref="refProgress"
          class="player__slider player__progress__container"
          @mousemove="playerState.isProgressHovering = true"
          @touchmove="playerState.isProgressHovering = true"
          @mousedown.stop="mouseDownHandle"
          @mouseup.stop="mouseUpHandle"
          @touchstart="touchStartHandle"
          @touchend="touchEndHandle">
          <div
            class="player__progress__holder"
            @mousemove="mouseMoveHandle"
            @touchmove="touchMoveHandle">
            <div
              class="player__load__progress"
              :style="loadProgressStyle"></div>
            <div
              class="player__play__progress"
              :style="playProgressStyle"></div>
          </div>
        </div>

        <button @click="togglePlay" class="player__button" title="Play">
          <el-icon :size="24" v-if="playerState.playBtnState === 'play'">
            <PlayIcon />
          </el-icon>
          <el-icon :size="24" v-else>
            <PauseIcon />
          </el-icon>
        </button>

        <button class="player__button" title="Next">
          <el-icon :size="24">
            <NextIcon />
          </el-icon>
        </button>
        <button class="player__button" title="Volume" @click="mutedPlay">
          <el-icon :size="24" v-if="playerState.muted">
            <VolumeMutedIcon />
          </el-icon>
          <el-icon :size="24" v-else>
            <VolumeUpIcon />
          </el-icon>
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          class="player__volume__slider"
          v-model="playerState.volume" />
        <div class="player__times__span">
          <span
            >{{ playerState.currentTime }} {{ " / " }}
            {{ playerState.totalTime }}</span
          >
        </div>
        <div class="player__control--spacer"></div>
        <button
          class="player__button"
          title="Settings"
          @click="openSettingMenu">
          <el-icon
            :size="24"
            class="player__setting-icon"
            :class="
              playerState.openSetting ? 'player__setting--expanded' : null
            "
            aria-expanded="false">
            <SettingIcon />
          </el-icon>
        </button>
        <button
          class="player__button"
          title="Fullscreen"
          @click="toggleFullScreen">
          <el-icon :size="24" v-if="playerState.fullScreen">
            <EnterFullscreenIcon />
          </el-icon>
          <el-icon :size="24" v-else>
            <ExitFullscreenIcon />
          </el-icon>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.player-wrapper {
  background: black;
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}
.player-wrapper__fullscreen {
  height: 100%;
  padding-bottom: 0 !important;
}
video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.player__poster {
  background-color: #000;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: contain;
  height: 100%;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  transition: opacity 0.2s ease;
  width: 100%;
  z-index: 1;
}
.player-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  height: 3rem;
  width: 100%;
  align-items: center;
  background: linear-gradient(rgba(0, 0, 0, 0) 16.67%, rgb(0, 0, 0) 100%);
}
.player__slider {
  position: absolute;
  left: 1rem;
  right: 1rem;
  height: 1.5rem;
  top: -1rem;
}
.player__progress__container {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.player__progress__holder {
  border-radius: 0.25rem;
  height: 0.25rem;
  background-color: #73859f80;
  cursor: pointer;
  padding: 0;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  flex: auto;
  transition: all 0.2s;
}
.player__load__progress {
  border-radius: 0.25rem;
  background-color: #73859fbf;
  position: absolute;
  margin: 0;
  padding: 0;
  height: 100%;
}
.player__play__progress {
  border-radius: 0.25rem;
  background-color: var(--el-color-primary);
  position: absolute;
  margin: 0;
  padding: 0;
  height: 100%;
}
.player__play__progress:before {
  border: 0.25rem solid var(--el-color-primary);
  border-radius: 0.5rem;
  content: "";
  height: 0.25rem;
  top: -0.25rem;
  width: 0.25rem;
  background-color: var(--el-color-primary);
  position: absolute;
  font-size: 0.9em;
  line-height: 0.35em;
  right: -0.5em;
  z-index: 1;
}
.player-controls .player__button {
  cursor: pointer;
  border: none;
  background: none;
  padding: 0.75rem;
  color: white;
  outline: none;
}
.player__control--spacer {
  flex: 1;
}
.player__volume__slider {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  height: 0.125rem;
  width: 3rem;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
  outline: none;
}
.player__volume__slider::-webkit-slider-runnable-track {
  background-color: white;
  border-radius: 0.5rem;
  height: 0.125rem;
}
.player__volume__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: -3px;
  background-color: white;
  border-radius: 0.5rem;
  height: 0.5rem;
  width: 0.5rem;
}
.player__volume__slider:focus::-webkit-slider-thumb {
  background-color: var(--el-color-primary);
}
.player__volume__slider::-moz-range-track {
  background-color: white;
  border-radius: 0.5rem;
  height: 0.125rem;
}
.player__volume__slider::-moz-range-thumb {
  background-color: white;
  border: none;
  border-radius: 0.5rem;
  height: 0.5rem;
  width: 0.5rem;
}
.player__volume__slider:focus::-moz-range-thumb {
  background-color: var(--el-color-primary);
}
.player__times__span {
  font-size: 14px;
  color: white;
}
.player__big-play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  z-index: 2;
}
.player__big-play-button .player__button {
  cursor: pointer;
  border: none;
  background: none;
  padding: 0.75rem;
  color: white;
  outline: none;
}
.player__setting-icon {
  transition: all 0.3s ease-in-out;
}
.player__setting--expanded {
  transform: rotate(45deg);
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
