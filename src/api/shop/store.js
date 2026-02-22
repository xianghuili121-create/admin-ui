import request from '@/utils/request'

export function getStoreItemList(params) {
  return request({
    url: '/store/admin/list',
    method: 'get',
    params,
  })
}

export function saveStoreItem(data) {
  return request({
    url: '/store/admin/save',
    method: 'post',
    data,
  })
}

export function deleteStoreItem(params) {
  return request({
    url: '/store/admin/delete',
    method: 'delete',
    params,
  })
}
