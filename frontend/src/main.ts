import { createApp } from "vue";
import { createClient, defaultPlugins } from "villus";
import ElementPlus from "element-plus";
import { createPinia } from "pinia";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { backendGraphQLURl } from "@/services/api";
import { authPluginWithRefresh } from "@/services/refreshToken";

const client = createClient({
  url: backendGraphQLURl,
  use: [authPluginWithRefresh, ...defaultPlugins()],
});

const pinia = createPinia();

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.use(pinia);
app.use(client);
app.mount("#app");
