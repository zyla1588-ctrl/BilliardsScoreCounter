import axios from 'axios'
import { showToast } from 'vant'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method.toUpperCase(), config.url, config.data);
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Token included:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('No token available');
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log('API response success:', response.config.url, response.data);
    return response.data
  },
  (error) => {
    console.error('API response error:', error.config?.url, error.response?.data);
    const message = error.response?.data?.error || '请求失败'
    showToast(message)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default request 