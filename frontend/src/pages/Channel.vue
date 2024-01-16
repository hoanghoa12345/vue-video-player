<script setup lang="ts"></script>






<template>
  <div class="channel__container">
    <div class="channel__banner">
      <el-image class="channel__banner__image" src="https://placehold.co/1504x208/AACAF9/FFF" alt="">
        <template #placeholder>
          <img src="" alt="" />
        </template>
      </el-image>
    </div>
    <div class="channel__info-container">
      <div class="channel__avatar-wrapper">
        <el-avatar class="channel__avatar-image" size="large">A</el-avatar>
      </div>
      <div class="channel__info">
        <h2 class="channel__info-name">Channel name</h2>
        <div class="channel__statics">
          <div>
            <span class="channel__statics__number">0</span>
            <span class="channel__statics__name">Video</span>
          </div>
          <div>
            <span class="channel__statics__number">0</span>
            <span class="channel__statics__name">Follower</span>
          </div>
          <div>
            <span class="channel__statics__number">0</span>
            <span class="channel__statics__name">Like</span>
          </div>
        </div>
      </div>
      <div>
        <el-button type="primary" size="large" round>Subscribe</el-button>
      </div>
    </div>

    <div>
    </div>
  </div>
</template>

 <script setup lang="ts"></script> 






