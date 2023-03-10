<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import Hls from "hls.js";

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

const init = () => {
  if (refVideo.value?.canPlayType("application/vnd.apple.mpegurl")) {
    refVideo.value?.play();
  } else if (Hls.isSupported()) {
    const hls = new Hls();

    hls.detachMedia();
    hls.attachMedia(refVideo.value!);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(props.src);
      console.log("on attached");
      hls.on(Hls.Events.MANIFEST_PARSED, (ev, data) => {
        console.log(data);
        console.log("auto play", props.autoPlay);

        if (props.autoPlay) {
          // Auto play video
          refVideo.value?.play();
        }
      });
      hls.on(Hls.Events.LEVEL_SWITCHING, (ev, data) => {
        console.log(data);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (ev, data) => {
        console.log(data);
      });
    });
  }
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
</script>

<template>
  <div class="player-wrapper">
    <video controls ref="refVideo" />
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
</style>
