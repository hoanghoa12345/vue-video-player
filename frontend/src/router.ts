import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import AppLayout from "@/layout/Layout.vue";
import NProgress from "@/utils/nprogress";

NProgress.configure({ showSpinner: false });

const routes: Array<RouteRecordRaw> = [
  {
    name: "AppLayout",
    path: "/",
    component: AppLayout,
    children: [
      {
        name: "Index",
        path: "",
        component: () => import("@/pages/Index.vue"),
      },
      {
        name: "Category",
        path: "category",
        component: () => import("@/pages/Category.vue"),
      },
      {
        name: "Video",
        path: "video/:id",
        component: () => import("@/pages/Video.vue"),
      },
      {
        name: "Channel",
        path: "channel/:id",
        component: () => import("@/pages/Channel.vue"),
      },
      {
        name: "Admin",
        path: "admin",
        component: () => import("@/pages/Admin.vue"),
        children: [
          {
            name: "VideoManage",
            path: "video",
            component: () => import("@/pages/VideoManage.vue"),
            children: [
              {
                name: "VideoTable",
                path: "",
                component: () =>
                  import("@/components/video-list/VideoTable.vue"),
              },
              {
                name: "CreateVideo",
                path: "create",
                component: () =>
                  import("@/components/create-video/CreateVideoStep.vue"),
              },
            ],
          },
        ],
      },
      {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/pages/NotFound.vue"),
      },
    ],
  },
  {
    name: "Login",
    path: "/login",
    component: () => import("@/pages/Login.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  next();
  NProgress.start();
});

router.afterEach((to, from) => {
  NProgress.done();
});
export default router;
