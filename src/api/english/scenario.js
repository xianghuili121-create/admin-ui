import request from '@/utils/request'

export function getScenarioPage(params) {
  return request({
    url: '/english/scenarios/page',
    method: 'get',
    params
  })
}

export function addScenario(data) {
  return request({
    url: '/english/scenarios',
    method: 'post',
    data
  })
}

export function updateScenario(id, data) {
  return request({
    url: `/english/scenarios/${id}`,
    method: 'put',
    data
  })
}

export function deleteScenario(id) {
  return request({
    url: `/english/scenarios/${id}`,
    method: 'delete'
  })
}
