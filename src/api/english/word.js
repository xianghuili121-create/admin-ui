import request from '@/utils/request';

// 获取单词列表
export function getWordList(params) {
  return request({
    url: '/english/word/list',
    method: 'get',
    params
  });
}

// 创建单词
export function createWord(data) {
  return request({
    url: '/english/word',
    method: 'post',
    data
  });
}

// 更新单词
export function updateWord(id, data) {
  return request({
    url: `/english/word/${id}`,
    method: 'put',
    data
  });
}

// 删除单词
export function deleteWord(id) {
  return request({
    url: `/english/word/${id}`,
    method: 'delete'
  });
}
