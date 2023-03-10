import { defineStore } from "pinia";

export const useAppStore = defineStore({
  id: "main-app",
  state: () => ({
    appTheme: "light",
    version: "1.0.0",
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
  },
});
