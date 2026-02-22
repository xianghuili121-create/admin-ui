import { createRouter, createWebHistory } from 'vue-router';
import { usePermissionStore } from '@/stores/permission';
import { getToken } from '@/utils/myCookie';
import { removeToken } from '@/utils/myCookie';
// 获取所有视图组件
const viewModules = import.meta.glob('@/views/**/*.vue');

//  组件加载函数
const loadComponent = (path) => {
  const modulePath = `/src/views/${path}.vue`;
  if (viewModules[modulePath]) {
    return viewModules[modulePath];
  }

  console.warn(`组件未找到: ${modulePath}`);
  return () => import('@/views/error/404.vue');
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: () => import('@/layout/index.vue'),
      children: [],
    },
    { path: '/login', name: 'login', component: () => import('@/views/login.vue') },
  ],
});
let isLoad = false;

export default router;
router.beforeEach(async (to, from, next) => {
  const token = getToken();

  if (to.path === '/login') {
    isLoad = false;
    next();
    return;
  }

  if (!token) {
    next('/login');
    return;
  }

  if (!isLoad) {
    const permissionStore = usePermissionStore();
    try {
      await permissionStore.loadInfo();
      const userRouter = permissionStore.userRouter;

      userRouter.forEach((route) => {
        router.addRoute('layout', {
          path: route.path,
          name: route.name,
          component: loadComponent(route.component),
        });
      });

      router.addRoute('layout', {
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/error/404.vue'),
      });

      isLoad = true;
      next({ ...to, replace: true });
    } catch (e) {
      isLoad = false;
      removeToken();
      next('/login');
    }
    return;
  }

  next();
});
