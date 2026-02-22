import request from '@/utils/request';

export function getGoodsList(params) {
  return request({
    url: '/goods/list',
    method: 'get',
    params,
  });
}

export function getGoodsById(id) {
  return request({
    url: '/goods/' + id,
    method: 'get',
  });
}

export function addGoods(data) {
  return request({
    url: '/goods',
    method: 'post',
    data,
  });
}

export function editGoods(data) {
  return request({
    url: '/goods',
    method: 'put',
    data,
  });
}

export function deleteGoods(ids) {
  return request({
    url: '/goods',
    method: 'delete',
    data: { ids },
  });
}

export function updateGoodsStatus(data) {
  return request({
    url: '/goods/status',
    method: 'put',
    data,
  });
}

