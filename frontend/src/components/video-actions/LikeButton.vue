<template>
  <div class="video-info__like_number">
    <button class="video-info__like-button" @click="emit('likeVideo', videoId)">
      <svg
        v-if="props.isLike"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 16 16">
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M8 1.314C12.438-3.248 23.534 4.735 8 15C-7.534 4.736 3.562-3.248 8 1.314" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 16 16">
        <path
          fill="currentColor"
          d="m8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385c.92 1.815 2.834 3.989 6.286 6.357c3.452-2.368 5.365-4.542 6.286-6.357c.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
      </svg>
    </button>

    <span>{{ props.likeCount }}</span>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  videoId: string;
  likeCount: number;
  isLike?: boolean;
}>();

const emit = defineEmits<{
  likeVideo: [id: string];
}>();
</script>
