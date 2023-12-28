<script setup lang="ts">
import { onMounted, reactive, ref, Ref, watch } from "vue";
import Hls from "hls.js";
import { debounce } from "lodash-es";

type PlayerState = {
  playerProgress: number;
  currentTime: string;
  totalTime: string;
  fullScreen: boolean;
  playBtnState: "pause" | "play";
  preloadBar: number;
  muted: boolean;
  volume: number;
  isVideoHovering: boolean;
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

const playerState = reactive<PlayerState>({
  // loadStateType: "loadstart"
  playerProgress: 0,
  currentTime: "00:00",
  totalTime: "00:00",
  fullScreen: false,
  playBtnState: props.autoPlay ? "pause" : "play",
  preloadBar: 0,
  muted: false,
  volume: 1,
  isVideoHovering: false,
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
          // console.log("Autoplay was prevented", error);
        });
    }
  } else if (Hls.isSupported()) {
    const hls = new Hls();

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
          refVideo.value?.play();
          console.log(
            "%cVue.Player",
            "color:#caf0f8;padding:4px;background:#0077b6;border-radius:4px",
            "Autoplay started!"
          );
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
  playerState.playerProgress = (currentTime * 100) / duration;
  playerState.currentTime = timeFormat(currentTime);
  playerState.totalTime = timeFormat(duration);
};

const onCanPlay = (event: Event) => {
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

// const onDurationChange = (event: Event) => {
//   if(playerState.currentTime !== 0 && refVideo.value) {
//     refVideo.value.currentTime =
//   }
// }

const onProgress = (event: Event) => {
  const videoElement = event.target as HTMLMediaElement;
  const duration = videoElement.duration;
  const length = videoElement.buffered.length;
  const end =
    videoElement.buffered.length && videoElement.buffered.end(length - 1);
  playerState.preloadBar = (end * 100) / duration;
};

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
      });
    } else {
      el.requestFullscreen().then(() => {
        playerState.fullScreen = true;
      });
    }
  }
};

const onPlaying = (event: Event) => {};

const hideControl = debounce(() => {
  playerState.isVideoHovering = false;
  // if (playerState.playBtnState !== "play") {
  // playerState.isTop = false;
  // }
  if (refVideo.value) refVideo.value.style.cursor = "none";
}, 1500);

const mouseMoveWarp = () => {
  if (refVideo.value) refVideo.value.style.cursor = "auto";
  playerState.isVideoHovering = true;
  hideControl();
};

const onPause = () => {};

const mouseMoveHandle = (event: Event) => {
  // console.log('move: ', event);
  
}

const mouseDownHandle = (event: Event) => {
  console.log('down: ', event);
}
</script>

<template>
  <div
    class="player-wrapper"
    ref="refPlayerWrap"
    @mousemove="mouseMoveWarp"
    @mouseleave="playerState.isVideoHovering = false">
    <div class="player__video">
      <video
        ref="refVideo"
        :muted="playerState.muted"
        :volume="playerState.volume"
        @timeupdate="onTimeUpdate"
        @canplay="onCanPlay"
        @ended="onEnded"
        @progress="onProgress"
        @playing="onPlaying"
        @pause="onPause" />
    </div>
    <Transition v-if="playerState.playBtnState === 'play'">
      <div class="player__big-play-button">
        <button @click="togglePlay" class="player__button" title="Play">
          <el-icon :size="48" v-if="playerState.playBtnState === 'play'">
            <svg
              data-slot="icon"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true">
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"></path>
            </svg>
          </el-icon>
          <el-icon :size="48" v-else>
            <svg
              data-slot="icon"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true">
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"></path>
            </svg>
          </el-icon>
        </button>
      </div>
    </Transition>

    <Transition>
      <div
        class="player-controls"
        v-show="
          playerState.isVideoHovering || playerState.playBtnState === 'play'
        ">
        <div ref="refProgress" class="player__slider player__progress__container" @mousedown.stop="mouseDownHandle">
          <div class="player__progress__holder" @mousemove="mouseMoveHandle">
            <div
              class="player__load__progress"
              :style="{ width: `${playerState.preloadBar.toFixed(2)}%` }"></div>
            <div
              class="player__play__progress"
              :style="{
                width: `${playerState.playerProgress.toFixed(2)}%`,
              }"></div>
          </div>
        </div>

        <button @click="togglePlay" class="player__button" title="Play">
          <el-icon :size="24" v-if="playerState.playBtnState === 'play'">
            <svg
              data-slot="icon"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true">
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"></path>
            </svg>
          </el-icon>
          <el-icon :size="24" v-else>
            <svg
              data-slot="icon"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true">
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"></path>
            </svg>
          </el-icon>
        </button>

        <button class="player__button" title="Next">
          <el-icon :size="24">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-skip-forward">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" x2="19" y1="5" y2="19" />
            </svg>
          </el-icon>
        </button>
        <button class="player__button" title="Volume" @click="mutedPlay">
          <el-icon :size="24" v-if="playerState.muted">
            <svg
              data-slot="icon"
              fill="none"
              stroke-width="1.5"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"></path>
            </svg>
          </el-icon>
          <el-icon :size="24" v-else>
            <svg
              data-slot="icon"
              fill="none"
              stroke-width="1.5"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"></path>
            </svg>
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
          <span>{{ playerState.currentTime }}</span
          ><i>{{ " / " }}</i
          ><span>{{ playerState.totalTime }}</span>
        </div>
        <div class="player__control--spacer"></div>
        <button class="player__button" title="Settings">
          <el-icon :size="24">
            <svg
              data-slot="icon"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true">
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"></path>
            </svg>
          </el-icon>
        </button>
        <button
          class="player__button"
          title="Fullscreen"
          @click="toggleFullScreen">
          <el-icon :size="24" v-if="playerState.fullScreen">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-minimize">
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          </el-icon>
          <el-icon :size="24" v-else>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-maximize">
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
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
video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
}
.player__big-play-button .player__button {
  cursor: pointer;
  border: none;
  background: none;
  padding: 0.75rem;
  color: white;
  outline: none;
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
