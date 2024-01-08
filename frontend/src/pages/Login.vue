<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormInstance } from "element-plus";
import { User } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useMutation } from "villus";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const formRef = ref<FormInstance>();
const store = useUserStore();
const form = reactive({
  email: "",
  password: "",
});

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
  formEl.validate((valid) => {
    if (valid) {
      console.log("submit!");
      execute({ payload: form }).then(({ data, error }: any) => {
        // console.log("login response", data, error);

        if (!error) {
          const { name, email, roles, image, token, refresh_token } =
            data.login;
          store.login(data.login);
          localStorage.setItem("userInfo", JSON.stringify(data.login));
          localStorage.setItem("access_token", token);
          localStorage.setItem("refresh_token", refresh_token);

          // console.log("Hello " + name);

          router.push("/");
        } else {
          // console.log(error);

          ElMessage.error("Oops, Invalid email or password.");
        }
      });
    } else {
      // console.log("error submit!");
      ElMessage.error("Oops, please input correct email or password.");
      return false;
    }
  });
};
</script>
<template>
  <section class="container login-container">
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
        <el-form-item class="login-button__group">
          <el-button
            type="primary"
            @click="onSubmit(formRef)"
            :loading="isFetching"
            >Login</el-button
          >
          <el-button @click="router.back()">Cancel</el-button>
        </el-form-item>
      </el-form>
    </div>
  </section>
</template>
<style scoped>
.login-container {
  display: grid;
  place-content: center;
  height: 100vh;
}
.login-card {
  width: 25rem;
  height: 32rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow)
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
</style>
