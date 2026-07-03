import api from "@/services/api";
import { defineStore } from "pinia";

export const useAppStore = defineStore('main-app', {
  state: () => ({
    appTheme: "light",
    version: "1.0.0",
    config: {} as any,
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
      api.getAppSettings().then((res) => {
        this.config = res.data.objects[0];
      }).catch((err) => {
        console.error(err)
      })
    }
  },
   getters: {
    pageConfig: (state) => {
      return (pageName: string) => state.config ? state.config.metadata.config.pages[pageName] : null;
    }
  },
});
