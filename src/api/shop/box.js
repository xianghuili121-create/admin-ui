import request from '@/utils/request';

export function getBoxDropPool(boxId) {
  return request({
    url: '/box/pool/' + boxId,
    method: 'get',
  });
}

export function saveBoxDropPool(boxId, items) {
  return request({
    url: '/box/pool/' + boxId,
    method: 'put',
    data: { items },
  });
}

export function addBoxDropItem(boxId, data) {
  return request({
    url: '/box/pool/' + boxId + '/item',
    method: 'post',
    data,
  });
}

export function deleteBoxDropItem(id) {
  return request({
    url: '/box/pool/item/' + id,
    method: 'delete',
  });
}

