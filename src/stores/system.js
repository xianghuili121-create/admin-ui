import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useMediaQuery } from '@vueuse/core';

export const useSystemStore = defineStore('system', () => {
  // -----菜单收缩-----
  const menuIsCollapse = ref(true);
  function switchMenuCollapse() {
    menuIsCollapse.value = !menuIsCollapse.value;
  }

  //   头部按钮组显示隐藏
  const buttonsIsShow = ref(true);

  //   -----屏幕适配-----
  // 监听「移动端」：屏幕宽度 ≤768px
  const isMobile = useMediaQuery('(max-width: 768px)');
  // 监听「平板」：769px ≤ 屏幕宽度 ≤1024px
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  // 监听「桌面端」：屏幕宽度 ≥1025px
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  watch(
    [isMobile, isTablet, isDesktop],
    ([newIsMobile, newIsTablet, newIsDesktop], [oldIsMobile, oldIsTablet, oldIsDesktop]) => {
      if (newIsMobile) {
        // console.log(`isMobile ${oldIsMobile} → ${newIsMobile}`);
        menuIsCollapse.value = newIsMobile;
        buttonsIsShow.value = oldIsMobile;
      }
      if (newIsTablet) {
        // console.log(`isTablet ${oldIsTablet} → ${newIsTablet}`);
        menuIsCollapse.value = oldIsTablet;
        buttonsIsShow.value = newIsTablet;
      }
      if (newIsDesktop) {
        // console.log(`isDesktop ${oldIsDesktop} → ${newIsDesktop}`);
        menuIsCollapse.value = oldIsDesktop;
        buttonsIsShow.value = newIsDesktop;
      }
    },
    { immediate: true }
  );

  return { menuIsCollapse, switchMenuCollapse, buttonsIsShow };
});
