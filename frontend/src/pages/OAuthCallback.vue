<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { ElLoading, ElMessage } from "element-plus";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const query = route.query;
const appStore = useAppStore();
const userStore = useUserStore();

onMounted(() => {
  if (query.code) {
    const code_verifier = sessionStorage.getItem("code_verifier");
    const stored_state = sessionStorage.getItem("state");
    const state = query.state;
    if (code_verifier && state) {
      const backendUrl = appStore.backendUrl;
      if (backendUrl) {
        const loading = ElLoading.service({
          lock: true,
          text: "Loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        fetch(`${backendUrl}/v1/oauth/exchange`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            code: query.code,
            code_verifier,
            state,
            stored_state,
            provider: "oauth2",
          }),
        })
          .then((res) => {
            if (res.ok) {
              res.json().then((data) => {
                if (data.error) {
                  ElMessage.error(data.error_description?.toString());
                } else {
                  const { access_token, id_token, expires_in, user } = data;
                  userStore.login(user, access_token, id_token, expires_in);
                  sessionStorage.removeItem("code_verifier");
                  sessionStorage.removeItem("state");
                  router.push("/");
                }
              });
            } else {
              ElMessage.error(
                "Oops, there was an error connecting to the server."
              );
            }
            loading.close();
          })
          .catch(() => {
            ElMessage.error(
              "Oops, there was an error connecting to the server."
            );
            loading.close();
          });
      } else {
        ElMessage.error("Oops, this feature is not supported yet.");
      }
    } else {
      ElMessage.error("Invalid state or code_verifier");
    }
  }
});
</script>

<template>
  <div v-if="query.error">
    <el-result
      icon="error"
      title="Error"
      :sub-title="query.error_description?.toString()">
      <template #extra>
        <el-button type="primary" @click="router.push('/login')"
          >Back to Login</el-button
        >
      </template>
    </el-result>
  </div>
</template>
