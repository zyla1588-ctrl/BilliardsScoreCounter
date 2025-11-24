import request from './request'

export const authAPI = {
  // 用户注册
  register(data) {
    return request.post('/register', data)
  },

  // 用户登录
  login(data) {
    return request.post('/login', data)
  },

  // 获取用户信息
  getUserInfo() {
    return request.get('/user')
  }
} 