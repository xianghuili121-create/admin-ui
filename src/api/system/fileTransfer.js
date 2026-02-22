import request from '@/utils/request';

export function uploadFiles(formData) {
  return request({
    url: '/files/upload',
    method: 'post',
    data: formData,
  });
}

export function listFiles(params) {
  return request({
    url: '/files/list',
    method: 'get',
    params,
  });
}

export function deleteFile(id) {
  return request({
    url: '/files/' + id,
    method: 'delete',
  });
}

export function getFileUrl(id) {
  return request({
    url: '/files/' + id + '/url',
    method: 'get',
  });
}

export function sendTransfer(data) {
  return request({
    url: '/file-transfers/send',
    method: 'post',
    data,
  });
}

export function inboxTransfers(params) {
  return request({
    url: '/file-transfers/inbox',
    method: 'get',
    params,
  });
}

export function outboxTransfers(params) {
  return request({
    url: '/file-transfers/outbox',
    method: 'get',
    params,
  });
}

export function markTransferRead(id) {
  return request({
    url: '/file-transfers/' + id + '/read',
    method: 'post',
  });
}

export function withdrawTransfer(id) {
  return request({
    url: '/file-transfers/' + id + '/withdraw',
    method: 'post',
  });
}
