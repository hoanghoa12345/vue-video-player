import api from "@/services/api";
import { AppSettings } from "@/utils/types";
import { defineStore } from "pinia";

export const useAppStore = defineStore("main-app", {
  state: () => ({
    appTheme: "light",
    version: "1.0.0",
    config: null as AppSettings | null,
    initialize: false,
  }),
  actions: {
    toggleColorMode() {
      let htmlElClass = document.documentElement.classList;
      let currentColor = this.appTheme;

      if (currentColor === "light") {
        this.$patch({
          appTheme: "dark",
        });
        htmlElClass.add("dark");
      }

      if (currentColor === "dark") {
        this.$patch({
          appTheme: "light",
        });
        if (htmlElClass.contains("dark")) htmlElClass.remove("dark");
      }
    },
    loadAppConfig() {
      api
        .getAppSettings()
        .then((res) => {
          this.config = res.data.objects[0];
          this.initialize = true;
        })
        .catch((err) => {
          this.initialize = false;
          console.error(err);
        });
    },
  },
  getters: {
    pageConfig: (state) => {
      return (pageName: string) =>
        state.config ? state.config.metadata.config.pages[pageName] : null;
    },
    backendUrl: (state) => {
      if (import.meta.env.DEV) {
        return import.meta.env.VITE_BACKEND_API_URL;
      }
      return state.config?.metadata.config.backend_url;
    },
  },
});
