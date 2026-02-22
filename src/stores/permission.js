import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { getUserMenu } from '@/api/system/user';
import { getUserInfo } from '@/api/auth';
// 用 Vite 的 import.meta.glob 预加载 @/views 下所有 .vue 文件
const viewModules = import.meta.glob('@/views/**/*.vue', { eager: true });

export const usePermissionStore = defineStore('permission', () => {
  // 用户信息
  const userInfo = ref({});
  // 路由
  const userRouter = ref([]);
  //   菜单
  const userMenu = ref([]);

  //   向后端获取基本信息
  const loadInfo = async () => {
    const resultUserInfo = await getUserInfo();
    if (!resultUserInfo || resultUserInfo.code !== 200) {
      throw new Error(resultUserInfo?.message || '获取用户信息失败');
    }

    userRouter.value = resultUserInfo.data.userRouter || [];
    userInfo.value = resultUserInfo.data || {};

    const resultMenu = await getUserMenu();
    if (!resultMenu || resultMenu.code !== 200) {
      throw new Error(resultMenu?.message || '获取用户菜单失败');
    }
    userMenu.value = resultMenu.data || [];
  };
  const reset = () => {
    userInfo.value = {};
    userRouter.value = [];
    userMenu.value = [];
  };
  return { userInfo, userRouter, loadInfo, userMenu, reset };
});
