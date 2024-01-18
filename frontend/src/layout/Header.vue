<script setup lang="ts">
import { Search, Upload, MoreFilled } from "@element-plus/icons-vue";
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
  // console.log(queryString);
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
  // console.log(key, keyPath);
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
const clipParts = ["https://cdn3.iconfinder.com/data/icons/colour-flower/32/15-512.png", "https://cdn-icons-png.flaticon.com/512/9181/9181358.png"]
</script>




<template>
  <el-header class="header">
    <el-menu mode="horizontal" :ellipsis="false" menu-trigger="click" class="container items-center header-logo"
      @select="handleSelectMenu">
      <el-menu-item index="0">
        <router-link to="/" class="logo__link">
          <div class="flex items-center logo" style="position: relative">
            <img class="logo__image" width="32" height="32" src="/images/logo.webp" alt="logo" />
            <!--img :src="clipParts[0]" style="
                width: 16px;
                height: 16px;
                rotate: 30deg;
                position: absolute;
                right: 67px;
                top: 15px;
              " /-->
            <p class="logo__text">MyClip</p>
          </div>
        </router-link>
      </el-menu-item>
      <div class="flex-grow" />
      <div index="1" class="search-box">
        <el-autocomplete ref="autocompleteRef" v-model="state" :fetch-suggestions="querySearchAsync"
          placeholder="Enter keyword to search" @select="handleSelectComplete" :suffix-icon="Search"
          @keydown.space="keySpaceHandle" />
      </div>
      <div class="flex-grow" />
      <el-menu-item v-if="userStore.roles.includes('admin')" index="menu-upload">
        <el-icon>
          <Upload />
        </el-icon>
      </el-menu-item>
      <el-sub-menu index="menu" class="header-menu">
        <template #title>
          <el-icon class="header-menu__icon">
            <MoreFilled />
          </el-icon>
        </template>
        <el-menu-item v-if="userStore.name" index="menu-login">Hello, {{ userStore.name }}!</el-menu-item>
        <el-menu-item v-else index="menu-login">Login</el-menu-item>

        <el-menu-item index="menu-subscribe">Followed channel</el-menu-item>
        <el-menu-item index="menu-watchlate">Watch later</el-menu-item>
        <el-menu-item index="menu-theme">Theme mode: {{ colorMode }}</el-menu-item>
        <el-menu-item v-if="userStore.token" @click="onLogout" index="menu-logout">Logout</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-header>
</template>




<style>
.el-menu--horizontal {
  border-bottom: none !important;
}

.flex {
  display: flex;
}

.header-logo {
  height: 5rem;
}

.header-logo.el-menu--horizontal>.el-menu-item.is-active {
  border-bottom: none;
}

.logo__link {
  text-decoration: none;
}

.logo {
  gap: 4px;
  height: 72px;
}

.logo__image {
  width: 32px;
  height: 32px;
}

.logo__text {
  font-size: 20px;
  font-weight: 600;
  margin-block-start: 0;
  margin-block-end: 0;
}

.flex-grow {
  flex-grow: 1;
}

.items-center {
  align-items: center;
}

.el-menu-item * {
  vertical-align: middle;
}

.search-box {
  width: var(--search-box-width);
}

.search-box .el-autocomplete {
  width: 100%;
}

.search-box .el-input__wrapper {
  border-radius: 10px;
  background-color: var(--el-disabled-bg-color);
  box-shadow: none;
  height: 36px;
}

.search-box .el-input__inner {
  font-family: inherit;
}

.search-box .el-input__icon {
  width: 20px;
  height: 20px;
}

.search-box .el-icon svg {
  width: 20px;
  height: 20px;
}

.header-menu .el-sub-menu__title {
  border-bottom: none;
}

.header-menu.is-active .el-sub-menu__title {
  border-bottom: none !important;
}

.header-menu__icon {
  rotate: 90deg;
}

.header-menu .el-sub-menu__icon-arrow {
  display: none;
}
</style>



