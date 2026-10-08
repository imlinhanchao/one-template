import { createRouter, createWebHashHistory } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        {
          path: "/",
          name: "home",
          component: () => import("@/views/HomeView.vue"),
          meta: {
            title: "首页",
          },
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/sys/login.vue"),
      meta: {
        title: "登录",
      },
    },
    {
      path: "/login/:source",
      name: "logining",
      component: () => import("@/views/sys/login.vue"),
      meta: {
        title: "登录中...",
      },
    },
    {
      path: "/:username/verification",
      name: "user-verification",
      component: () => import('@/views/EmailVerificationView.vue'),
      meta: {
        title: "邮箱验证",
      },
    },
    {
      path: "/:from/:username/verification",
      name: "user-verification-from",
      component: () => import('@/views/EmailVerificationView.vue'),
      meta: {
        title: "邮箱验证",
      },
    },
    {
      path: "/config",
      name: "config",
      component: () => import("@/views/sys/config.vue"),
      meta: {
        title: "系统配置",
      },
    },
    {
      path: "/:username",
      name: "user-profile",
      component: () => import('@/views/UserProfileView.vue'),
      meta: {
        title: "用户资料",
      },
    },

  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const pageTitle = to.meta.title
    ? `${to.meta.title} · Haide UI Template`
    : "Haide UI Template";
  document.title = pageTitle;
});

export default router;
