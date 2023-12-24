<template>
  <div class="comments__container">
    <div class="comments__header">
      <h2 class="comments__header__title">Comments</h2>
    </div>
    <div class="comments__main">
      <div v-for="comment in comments" :key="comment._id" class="comment__card">
        <el-avatar>{{ getUsernameInitial(comment.user.name) }}</el-avatar>
        <div>
          <p class="comment__info">
            <span class="comment__username">{{ comment.user.name }}</span>
            <span class="comment__bullet">•</span>
            <span class="comment__timestamp">{{
              dayjs(Number(comment.createdAt)).fromNow()
            }}</span>
          </p>
          <p class="comment__text">{{ comment.body }}</p>
          <div class="comment_actions">
            <span>
              <el-button size="large" link>
                <el-icon :size="16">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="512"
                    height="512"
                    viewBox="0 0 512 512">
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="32"
                      d="M352.92 80C288 80 256 144 256 144s-32-64-96.92-64c-52.76 0-94.54 44.14-95.08 96.81c-1.1 109.33 86.73 187.08 183 252.42a16 16 0 0 0 18 0c96.26-65.34 184.09-143.09 183-252.42c-.54-52.67-42.32-96.81-95.08-96.81" />
                  </svg>
                </el-icon>
                <el-icon :size="16" v-if="false">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="512"
                    height="512"
                    viewBox="0 0 512 512">
                    <path
                      fill="currentColor"
                      d="m256 448l-9-6c-42.78-28.57-96.91-60.86-137-108.32c-42.25-50-62.52-101.35-62-157C48.63 114.54 98.46 64 159.08 64c48.11 0 80.1 28 96.92 48.21C272.82 92 304.81 64 352.92 64c60.62 0 110.45 50.54 111.08 112.65c.56 55.68-19.71 107-62 157c-40.09 47.49-94.22 79.78-137 108.35Z" />
                  </svg>
                </el-icon>
              </el-button>
              <span class="comment__number">0</span>
            </span>
            <span>
              <el-button :icon="ChatDotRound" size="large" link />
              <span class="comment__number">0</span>
            </span>

            <el-button type="primary" size="small" link>Reply</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="comments__footer">
      <div class="user-input__wrapper">
        <div class="input__user-avatar">
          <el-avatar :icon="UserFilled" />
        </div>
        <el-input
          class="input__input--large"
          placeholder="Write your comment"
          size="large"
          v-model="comment"
          minlength="3"
          maxlength="500"
          show-word-limit
          clearable />
        <el-button type="primary" size="large" @click="createComment"
          >Comment</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserFilled, ChatDotRound } from "@element-plus/icons-vue";
import { useMutation } from "villus";
import { PropType, h, onMounted, ref } from "vue";
import { CreateComment } from "@/services/graphql";
import { ElMessage } from "element-plus";
import { Comment } from "@/utils/types";
import { getUsernameInitial } from "@/utils/user";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const props = defineProps({
  comments: { type: Object as PropType<Comment[]>, required: true },
  videoId: { type: String, required: true },
});

const comment = ref<string>("");
const { data, execute } = useMutation(CreateComment);

const createComment = () => {
  console.log(comment.value);
  execute({
    videoId: props.videoId,
    comment: comment.value,
  }).then(({ data, error }) => {
    if (!error) {
      ElMessage({
        message: "Commented!",
        type: "success",
      });
    } else {
      ElMessage({
        message: error.message,
        type: "error",
      });
    }
  });
};

onMounted(() => {});
</script>
