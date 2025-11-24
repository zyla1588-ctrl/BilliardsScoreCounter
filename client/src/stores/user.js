import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/api/request'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  
  // 初始化用户状态
  const initUser = async () => {
    if (token.value) {
      try {
        const response = await request.get('/user')
        user.value = response.user
      } catch (error) {
        // 如果获取用户信息失败，清除token
        logout()
      }
    }
  }

  // 用户注册
  const register = async (userData) => {
    console.log('Register credentials:', userData);
    try {
      const response = await request.post('/register', userData);
      console.log('Register response:', response);
      
      // 保存token和用户信息
      token.value = response.token;
      user.value = response.user;
      localStorage.setItem('token', response.token);
      
      return response;
    } catch (error) {
      console.error('Register error in store:', error.response?.data || error.message);
      throw error;
    }
  }

  // 用户登录
  const login = async (credentials) => {
    console.log('Login credentials:', credentials);
    try {
      const response = await request.post('/login', credentials);
      console.log('Login response:', response);
      
      // 保存token和用户信息
      token.value = response.token;
      user.value = response.user;
      localStorage.setItem('token', response.token);
      
      return response;
    } catch (error) {
      console.error('Login error in store:', error.response?.data || error.message);
      throw error;
    }
  }

  // 用户登出
  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    initUser,
    register,
    login,
    logout
  }
}) 