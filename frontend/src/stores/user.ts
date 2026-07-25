import { defineStore } from "pinia";
import { User } from "@/utils/types";
let userInfo: User | null = null;
const user = localStorage.getItem("userInfo");
const accessToken = localStorage.getItem("access_token");
const idToken = localStorage.getItem("id_token");
const expiresIn = localStorage.getItem("expires_in");
if (user) {
  userInfo = JSON.parse(user);
}

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: userInfo,
    accessToken: accessToken,
    idToken: idToken,
    expiresIn: expiresIn,
  }),

  actions: {
    logout() {
      this.$patch({
        userInfo: null,
        accessToken: null,
        idToken: null,
        expiresIn: null,
      });
      localStorage.clear();
    },
    login(
      userInfo: User,
      accessToken: string,
      idToken: string,
      expiresIn: string
    ) {
      this.$patch({
        userInfo,
        accessToken,
        idToken,
        expiresIn,
      });
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("id_token", idToken);
      localStorage.setItem("expires_in", expiresIn);
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    },
  },
});
