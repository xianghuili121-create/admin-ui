import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken, removeToken } from './myCookie';
import router from '@/router/index';

// 定义全局标记，用于控制401弹窗只触发一次
let isHandling401 = false;

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  function (response) {
    const { status, data } = response;

    if (status === 200 && data.code === 200) return data;

    console.log(data);

    if (status === 500) ElMessage.error('服务器 500 错误.');

    return response;
  },
  function (error) {
    if (!error.response) {
      ElMessage.error('网络错误，请检查后端服务是否正常运行');
      return Promise.reject(error);
    }
    const { status, data } = error.response;
    console.log(error.response);
    if (status === 401 || data.code === 401) {
      // 如果已经在处理401，直接返回，不重复触发弹窗
      if (isHandling401) return Promise.reject(error);

      // 标记为正在处理401
      isHandling401 = true;

      ElMessageBox.confirm(`【${data.message}】是否跳转登录页面进行重新登录？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // console.log(router);
          removeToken();
          router.push('/login');
        })
        .catch(() => {
          // 取消弹窗时，重置标记，保证后续如果有新的401能正常触发
          isHandling401 = false;
        });
    }
    if (status === 400 || data.code === 400) ElMessage.error(data.message);
    if (status === 500 || data.code === 500) ElMessage.error("服务器 500 错误.");
    return Promise.reject(error);
  }
);

export default request;
