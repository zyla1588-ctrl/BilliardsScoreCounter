import request from './request'

export const roomAPI = {
  // 创建房间
  createRoom(data) {
    return request.post('/rooms', data)
  },

  // 加入房间
  joinRoom(data) {
    return request.post('/rooms/join', data)
  },

  // 获取房间信息
  getRoomInfo(code) {
    return request.get(`/rooms/${code}`)
  },

  // 开始游戏
  startGame(data) {
    return request.post('/rooms/start', data)
  }
} 