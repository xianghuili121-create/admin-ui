import request from '@/utils/request'

export function getAdminChatSessions(params) {
  return request({
    url: '/chat/admin/sessions',
    method: 'get',
    params,
  })
}

export function claimChatSession(data) {
  return request({
    url: '/chat/admin/claim',
    method: 'post',
    data,
  })
}

export function getChatMessages(params) {
  return request({
    url: '/chat/messages',
    method: 'get',
    params,
  })
}

export function markChatRead(data) {
  return request({
    url: '/chat/read',
    method: 'post',
    data,
  })
}

export function uploadChatImage(file) {
  const form = new FormData()
  form.append('file', file)
  return request({
    url: '/upload/chat-image',
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function uploadChatAudio(file) {
  const form = new FormData()
  form.append('file', file)
  return request({
    url: '/upload/chat-audio',
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
