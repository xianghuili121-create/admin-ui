import request from '@/utils/request';

export function getOrderList(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params,
  });
}

export function getOrderById(id) {
  return request({
    url: '/order/' + id,
    method: 'get',
  });
}

