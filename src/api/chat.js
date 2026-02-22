import requst from '@/utils/requst';

// 登录
export function login(data) {
  return requst({
    url: '/auth/login',
    method: 'post',
    data,
  });
}
