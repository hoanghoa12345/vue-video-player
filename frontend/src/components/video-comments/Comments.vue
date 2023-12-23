<template>
  <div class="comments__container">
    <div class="comments__header">
      <h2 class="comments__header__title">Comments</h2>
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
          show-word-limit
          clearable />
        <el-button type="primary" size="large">Comment</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserFilled } from "@element-plus/icons-vue";
</script>
