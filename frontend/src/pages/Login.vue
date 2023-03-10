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
  console.log("login response", data);
}

const onSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      console.log("submit!");
      execute({ payload: form }).then(({ data, error }: any) => {
        console.log("login response", data, error);

        if (!error) {
          const { name, email, roles, image, token, refresh_token } =
            data.login;
          store.login(data.login);
          localStorage.setItem("userInfo", JSON.stringify(data.login));
          localStorage.setItem("access_token", token);
          localStorage.setItem("refresh_token", refresh_token);

          console.log("Hello " + name);

          router.push("/");
        } else {
          console.log(error);

          ElMessage.error("Oops, Invalid email or password.");
        }
      });
    } else {
      console.log("error submit!");
      ElMessage.error("Oops, please input correct email or password.");
      return false;
    }
  });
};
</script>
<template>
  <section class="container">
    <div class="box">
      <img
        class="logo"
        width="122"
        height="30"
        src="http://myclip.vn/images/logo8.png"
        alt="logo" />
      <el-form
        class="form"
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
        <el-form-item>
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
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  background: #fff no-repeat;
  background-size: cover;
}
.box {
  width: 400px;
  height: 500px;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  background-color: white;
  position: absolute;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 6px 20px 5px rgba(152, 152, 152, 0.1),
    0 16px 24px 2px rgba(117, 117, 117, 0.14);
}
.box .form {
  width: 80%;
  margin: 50px auto 15px;
}
.box .el-input {
  margin-bottom: 20px;
}
.box .logo {
  margin-top: 2rem;
}
</style>
