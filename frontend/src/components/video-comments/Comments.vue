<template>
  <div class="comments__container">
    <div class="comments__header">
      <h2 class="comments__header__title">Comments</h2>
    </div>
    <div class="comments__main">
      <div v-for="comment in comments" :key="comment._id" class="comment__card">
        <el-avatar>{{ getUsernameInitial(comment.user.name) }}</el-avatar>
        <div>
          <p class="comment__text">{{ comment.body }}</p>
          <el-button type="primary" size="small" link>Reply</el-button>
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
import { UserFilled } from "@element-plus/icons-vue";
import { useMutation } from "villus";
import { PropType, onMounted, ref } from "vue";
import { CreateComment } from "@/services/graphql";
import { ElMessage } from "element-plus";
import { Comment } from "@/utils/types";
import { getUsernameInitial } from "@/utils/user";

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
    console.log(data);
  });
};

onMounted(() => {
  console.log(props.videoId);
});
</script>
