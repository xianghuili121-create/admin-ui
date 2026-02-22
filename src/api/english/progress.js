import request from '@/utils/request'

// 获取今日学习统计
export function getTodayStats() {
  return request({
    url: '/english/user/stats',
    method: 'get'
  })
}

// 每日签到
export function checkIn() {
  return request({
    url: '/english/user/checkin',
    method: 'post'
  })
}

// 获取每周活跃数据
export function getWeeklyActivity() {
  return request({
    url: '/english/user/weekly',
    method: 'get'
  })
}

// 获取排行榜
export function getLeaderboard() {
  return request({
    url: '/english/leaderboard',
    method: 'get'
  })
}
