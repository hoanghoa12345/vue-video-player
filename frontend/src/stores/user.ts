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
    loadUserInfo(backendUrl: string) {
      if (!backendUrl) {
        return Promise.reject({ error: "backendUrl is not set", code: 400 });
      }
      if (!this.idToken) {
        return Promise.reject({ error: "idToken is not set", code: 400 });
      }
      return new Promise((resolve, reject) => {
        fetch(backendUrl + "/v1/user/info", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.idToken}`,
          },
        })
          .then((res) => {
            if (res.ok) {
              res.json().then((data) => {
                resolve(data.user);
              });
            } else {
              res.json().then((data) => {
                reject(data);
              });
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    refreshToken(backendUrl: string) {
      if (!backendUrl) {
        return Promise.reject({ error: "backendUrl is not set", code: 400 });
      }
      if (!this.accessToken) {
        return Promise.reject({ error: "accessToken is not set", code: 400 });
      }
      return new Promise((resolve, reject) => {
        fetch(backendUrl + "/v1/oauth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            refresh_token: this.refreshToken,
          }),
        })
          .then((res) => {
            if (res.ok) {
              res.json().then((data) => {
                this.login(
                  this.userInfo!,
                  data.access_token,
                  data.id_token,
                  data.expires_in
                );
                resolve(data);
              });
            } else {
              res.json().then((data) => {
                reject(data);
              });
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
  },
});
