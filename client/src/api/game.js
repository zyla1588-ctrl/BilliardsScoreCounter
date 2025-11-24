import request from './request'

export const gameAPI = {
  // 添加分数
  addScore(data) {
    return request.post('/game/add-score', data)
  },

  // 结束游戏
  endGame(data) {
    return request.post('/game/end', data)
  },

  // 获取游戏日志
  getGameLogs(params) {
    return request.get('/game/logs', { params })
  },

  // 获取排行榜
  getRanking(params) {
    return request.get('/game/rank', { params })
  }
} 