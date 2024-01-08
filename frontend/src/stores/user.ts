import { defineStore } from "pinia";
import { User } from "@/utils/types";
let userInfo: User;
const user = localStorage.getItem("userInfo");
if (user) {
  userInfo = JSON.parse(user);
} else {
  userInfo = {
    _id: "",
    name: "",
    email: "",
    password: "",
    roles: [""],
    profilePic: "",
    token: "",
    refresh_token: "",
  };
}
export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    id: userInfo._id,
    name: userInfo.name,
    email: userInfo.email,
    roles: userInfo.roles,
    profilePic: userInfo.profilePic,
    token: userInfo.token,
    refresh_token: userInfo.refresh_token,
  }),

  actions: {
    logout() {
      this.$patch({
        id: "",
        name: "",
        email: "",
        roles: [],
        profilePic: "",
        token: "",
        refresh_token: "",
      });
    },
    login(user: User) {
      this.$patch({
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        profilePic: user.profilePic,
        token: user.token,
        refresh_token: user.refresh_token,
      });
    },
  },
});
