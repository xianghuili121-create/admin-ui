import axios from 'axios';
import request from '@/utils/request';
import { getToken } from '@/utils/myCookie';

export function listDbLogs(params) {
  return request({
    url: '/log/db/list',
    method: 'get',
    params,
  });
}

export function getDbLogDetail(id) {
  return request({
    url: '/log/db/' + id,
    method: 'get',
  });
}

export function deleteDbLogs(ids) {
  return request({
    url: '/log/db',
    method: 'delete',
    data: { ids },
  });
}

export function cleanupDbLogs(data) {
  return request({
    url: '/log/db/cleanup',
    method: 'post',
    data,
  });
}

export function exportDbLogs(data) {
  return request({
    url: '/log/export',
    method: 'post',
    data,
  });
}

export function listLogFiles() {
  return request({
    url: '/log/files',
    method: 'get',
  });
}

export async function downloadLogFile(fileName) {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const url = baseURL + '/log/files/' + encodeURIComponent(fileName);
  const res = await axios.get(url, {
    responseType: 'blob',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res;
}

