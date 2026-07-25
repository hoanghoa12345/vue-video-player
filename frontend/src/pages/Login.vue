<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormInstance } from "element-plus";
import { User } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useMutation } from "villus";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import { useAppStore } from "@/stores/app";
import { generatePkce } from "@/utils/oauth";

const router = useRouter();
const formRef = ref<FormInstance>();
const store = useUserStore();
const appStore = useAppStore();
const form = reactive({
  email: "",
  password: "",
});
const pageConfig = appStore.pageConfig("login");

const LoginMutation = `
  mutation Login ($payload: LoginPayload) {
    login(payload: $payload) {
        _id
        name
        email
        password
        roles
        profilePic
        token
        refresh_token
    }
  }
`;
const { data, execute, isDone, isFetching } = useMutation(LoginMutation);

if (isDone) {
  // console.log("login response", data);
}

const onSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid: boolean) => {
    if (valid) {
      ElMessage.error("Oops, this feature is not supported yet.");
      // execute({ payload: form }).then(({ data, error }: any) => {
      //   if (!error) {
      //     const { name, email, roles, image, token, refresh_token } =
      //       data.login;
      //     store.login(data.login, "", "", "");
      //     localStorage.setItem("userInfo", JSON.stringify(data.login));
      //     localStorage.setItem("access_token", token);
      //     localStorage.setItem("refresh_token", refresh_token);

      //     router.push("/");
      //   } else {
      //     ElMessage.error("Oops, Invalid email or password.");
      //   }
      // });
    } else {
      ElMessage.error("Oops, please input correct email or password.");
    }
  });
};

const onLoginWithProvider = async () => {
  const backendUrl = appStore.backendUrl;
  if (backendUrl) {
    const { code_verifier, code_challenge } = await generatePkce();
    const challenge = code_challenge;
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem("code_verifier", code_verifier);
    sessionStorage.setItem("state", state);
    fetch(
      `${backendUrl}/v1/oauth/url?challenge=${challenge}&state=${state}&provider=oauth2`
    ).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          window.location.href = data.url;
        });
      } else {
        ElMessage.error("Oops, there was an error connecting to the server.");
      }
    }).catch(() => {
      ElMessage.error("Oops, there was an error connecting to the server.");
    });
  } else {
    ElMessage.error("Oops, this feature is not supported yet.");
  }
};
</script>
<template>
  <section
    class="login-container"
    :style="{ backgroundImage: `url(${pageConfig?.background_url})` }">
    <div class="login-card">
      <div class="login-card__logo">
        <img
          class="logo__image"
          width="48"
          height="48"
          src="/images/logo.svg"
          alt="logo" />
        <p class="logo__text">MyClip</p>
      </div>

      <el-form
        class="login-form"
        :model="form"
        ref="formRef"
        label-position="top"
        label-width="120px">
        <el-form-item
          prop="email"
          label="Email"
          size="large"
          :rules="[
            {
              required: true,
              message: 'Please input email address',
              trigger: 'blur',
            },
            {
              type: 'email',
              message: 'Please input correct email address',
              trigger: ['blur', 'change'],
            },
          ]">
          <el-input
            v-model="form.email"
            placeholder="Please input email"
            :suffix-icon="User" />
        </el-form-item>
        <el-form-item
          prop="password"
          label="Password"
          size="large"
          :rules="[
            {
              required: true,
              message: 'Please input password',
              trigger: 'blur',
            },
          ]">
          <el-input
            v-model="form.password"
            placeholder="Please input password"
            show-password />
        </el-form-item>
        <div class="login-button__group">
          <el-button @click="router.back()">Go Back</el-button>
          <el-button
            type="primary"
            @click="onSubmit(formRef)"
            :loading="isFetching"
            >Login</el-button
          >
        </div>
        <el-button
          type="primary"
          class="login-button__provider"
          @click="onLoginWithProvider"
          >Login with Provider</el-button
        >
      </el-form>
    </div>
  </section>
</template>
<style scoped>
.login-container {
  display: grid;
  place-content: center;
  height: 100vh;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
}

.login-card {
  width: 25rem;
  height: 32rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow);
}

.login-card__logo {
  display: flex;
  gap: 4px;
  align-items: center;
  grid-column: 2/3;
  grid-row: 1/2;
}

.login-card .login-form {
  grid-column: 1/4;
  grid-row: 2/4;
  margin-left: 1rem;
  margin-right: 1rem;
}

.login-card .logo__image {
  width: 48px;
  height: 48px;
}

.login-form .login-button__provider {
  width: 100%;
}

.login-form .login-button__group {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.login-button__group .el-button {
  flex: 1;
}

@media (max-width: 767px) {
  .login-card {
    width: calc(100% - 2rem);
    height: 25rem;
    margin: 2rem auto;
  }
}
</style>
