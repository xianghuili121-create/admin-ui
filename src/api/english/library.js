import request from '@/utils/request';

// 获取词库列表 (复用已有的接口)
export function getLibraries() {
  return request({
    url: '/english/libraries',
    method: 'get'
  });
}

// 创建词库
export function createLibrary(data) {
  return request({
    url: '/english/library',
    method: 'post',
    data
  });
}

// 更新词库
export function updateLibrary(id, data) {
  return request({
    url: `/english/library/${id}`,
    method: 'put',
    data
  });
}

// 删除词库
export function deleteLibrary(id) {
  return request({
    url: `/english/library/${id}`,
    method: 'delete'
  });
}

// 初始化默认词库
export function initDefaultLibraries() {
  return request({
    url: '/english/library/init-defaults',
    method: 'post'
  });
}

// 获取 JSON 文件列表
export function getJsonFiles() {
  return request({
    url: '/english/library/json-files',
    method: 'get'
  });
}

// 导入 JSON 词库
export function importJsonLibrary(filename) {
  return request({
    url: '/english/library/import-json',
    method: 'post',
    data: { filename }
  });
}
