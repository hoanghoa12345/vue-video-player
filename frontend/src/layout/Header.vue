<script setup lang="ts">
import { Setting, Search, Upload } from "@element-plus/icons-vue";
import { ref, watch, computed } from "vue";
import { useMutation, useQuery } from "villus";
import { useRouter } from "vue-router";
import type { AutocompleteInstance } from "element-plus";
import { useDark, useToggle } from "@vueuse/core";
import { useUserStore } from "@/stores/user";
import { useAppStore } from "@/stores/app";

const router = useRouter();
const state = ref("");
const autocompleteRef = ref<AutocompleteInstance>();
const userStore = useUserStore();
const appStore = useAppStore();
const isDark = useDark();
const toggleDark = useToggle(isDark);

interface LinkItem {
  value: string;
  link: string;
}

const links = ref<LinkItem[]>([]);

const AllVideos = `
  query AllVideos {
    videos {
      _id
      title
    }
  }
`;

const { data } = useQuery({
  query: AllVideos,
});

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  console.log(queryString);
  const results = queryString
    ? links.value.filter(createFilter(queryString))
    : links.value;

  cb(results);
};

const createFilter = (queryString: string) => {
  return (videoItem: LinkItem) => {
    return (
      videoItem.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    );
  };
};

const handleSelectComplete = (item: any) => {
  console.log(item);
  router.push({ name: "Video", params: { id: item.link } });
  autocompleteRef.value?.blur();
};

watch(data, (data, oldData) => {
  data?.videos?.map((video: any) => {
    links.value.push({ value: video.title, link: video._id });
  });
});

const keySpaceHandle = (e: KeyboardEvent) => {
  //Menu item element plus has trigger space key to handle menu item
  //packages/components/menu/src/utils/menu-item.ts
  state.value = state.value += e.key;
};

const handleSelectMenu = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
  switch (key) {
    case "menu-login":
      if (userStore.name) router.push({ name: "VideoTable" });
      else router.push({ name: "Login" });
      break;
    case "menu-subscribe":
      router.push({ name: "Category" });
      break;
    case "menu-watchlate":
      router.push({ name: "NotFound" });
      break;
    case "menu-upload":
      router.push({ name: "CreateVideo" });
      break;
    case "menu-theme":
      toggleDark();
      break;
    default:
      break;
  }
};
const Logout = `
    mutation Logout($token: String) {
        logout (token: $token)
    }
  `;
const { execute } = useMutation(Logout);

const onLogout = () => {
  execute({ token: userStore.refresh_token }).then(({ data, error }) => {
    userStore.logout();
    localStorage.clear();
    router.push("/login");
  });
};

const colorMode = computed(() => (isDark.value ? "Dark" : "Light"));
</script>

<template>
  <el-header>
    <el-menu
      mode="horizontal"
      :ellipsis="false"
      menu-trigger="click"
      class="item-center"
      @select="handleSelectMenu">
      <el-menu-item index="0">
        <router-link to="/">
          <img
            width="122"
            height="30"
            src="http://myclip.vn/images/logo8.png"
            alt="logo" />
        </router-link>
      </el-menu-item>
      <div class="flex-grow" />
      <div index="1">
        <el-autocomplete
          ref="autocompleteRef"
          v-model="state"
          :fetch-suggestions="querySearchAsync"
          placeholder="Enter keyword to search"
          @select="handleSelectComplete"
          :suffix-icon="Search"
          @keydown.space="keySpaceHandle" />
      </div>
      <div class="flex-grow" />
      <el-menu-item
        v-if="userStore.roles.includes('admin')"
        index="menu-upload">
        <el-icon><Upload /></el-icon>
      </el-menu-item>
      <el-sub-menu index="menu">
        <template #title>
          <el-icon> <Setting /> </el-icon>
        </template>
        <el-menu-item v-if="userStore.name" index="menu-login"
          >Hello, {{ userStore.name }}!</el-menu-item
        >
        <el-menu-item v-else index="menu-login">Login</el-menu-item>

        <el-menu-item index="menu-subscribe">Followed channel</el-menu-item>
        <el-menu-item index="menu-watchlate">Watch later</el-menu-item>
        <el-menu-item index="menu-theme"
          >Theme mode: {{ colorMode }}</el-menu-item
        >
        <el-menu-item
          v-if="userStore.token"
          @click="onLogout"
          index="menu-logout"
          >Logout</el-menu-item
        >
      </el-sub-menu>
    </el-menu>
  </el-header>
</template>

<style>
.flex-grow {
  flex-grow: 1;
}
.item-center {
  align-items: center;
}
.el-menu-item * {
  vertical-align: middle;
}
</style>
