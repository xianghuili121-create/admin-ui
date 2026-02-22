import request from '@/utils/request';

// 查询用户列表
export function getUserList(query) {
  return request({
    url: '/user/list',
    method: 'get',
    params: query,
  });
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data,
  });
}

// 修改用户
export function aditUser(data) {
  return request({
    url: '/user',
    method: 'put',
    data,
  });
}

// 根据id查用户详细
export function getUserById(id) {
  return request({
    url: '/user/' + id,
    method: 'get',
  });
}

// 根据id删除用户
export function deleteUserById(data) {
  return request({
    url: '/user',
    method: 'delete',
    data,
  });
}

// 获取用户路由菜单
export function getUserMenu() {
  return request({
    url: '/user/menu',
    method: 'get',
  });
}

// 强制下线
export function logoutUserById(userId) {
  return request({
    url: '/user/logout/' + userId,
    method: 'post',
  });
}

export function getProfile() {
  return request({
    url: '/user/profile',
    method: 'get',
  });
}

export function updateProfile(data) {
  return request({
    url: '/user/profile',
    method: 'put',
    data,
  });
}

export function updatePassword(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data,
  });
}
