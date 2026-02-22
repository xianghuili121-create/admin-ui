import request from '@/utils/request';

export function getUserInventory(userId, params) {
  return request({
    url: '/inventory/user/' + userId,
    method: 'get',
    params,
  });
}

export function grantInventory(data) {
  return request({
    url: '/inventory/grant',
    method: 'post',
    data,
  });
}

export function deductInventory(data) {
  return request({
    url: '/inventory/deduct',
    method: 'post',
    data,
  });
}

