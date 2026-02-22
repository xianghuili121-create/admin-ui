import { createApp } from 'vue';
import { createPinia } from 'pinia';
// 引入持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import '@/styles/index.css';

import App from './App.vue';
import router from './router';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { registerPermissionDirective } from '@/directives/permission';

const app = createApp(App);
// 创建 Pinia 实例
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.use(ElementPlus);
registerPermissionDirective(app);

app.mount('#app');

// 全局挂载和注册 element-plus 的所有 icon
app.config.globalProperties.$icons = [];
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.config.globalProperties.$icons.push(key);
  app.component(key, component);
}
