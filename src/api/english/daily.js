import request from '@/utils/request'

export function getDailyPage(params) {
  return request({
    url: '/english/daily/page',
    method: 'get',
    params
  })
}

export function addDaily(data) {
  return request({
    url: '/english/daily',
    method: 'post',
    data
  })
}

export function updateDaily(id, data) {
  return request({
    url: `/english/daily/${id}`,
    method: 'put',
    data
  })
}

export function deleteDaily(id) {
  return request({
    url: `/english/daily/${id}`,
    method: 'delete'
  })
}
