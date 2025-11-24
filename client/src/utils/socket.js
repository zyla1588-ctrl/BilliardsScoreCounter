import { io } from 'socket.io-client'
import { useUserStore } from '@/stores/user'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'

class SocketManager {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.currentRoom = null
  }

  connect() {
    if (this.isConnected) return

    // 创建连接
    this.socket = io(import.meta.env.VITE_API_URL || 'http://47.119.149.236:3000', {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token') || ''
      }
    })

    // 连接事件
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
      this.isConnected = true
    })

    // 断开连接事件
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
      this.isConnected = false
    })

    // 错误处理
    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // 调试消息
    this.socket.on('message', (data) => {
      console.log('Socket message:', data)
    })

    return this.socket
  }

  // 加入房间
  joinRoom(roomCode, userId) {
    if (!this.isConnected) this.connect()
    
    console.log('Joining room:', roomCode, 'User ID:', userId)
    
    this.socket.emit('join_room', { roomCode, userId })
    this.currentRoom = roomCode
    
    // 监听房间相关事件
    this.setupRoomListeners()
  }

  // 离开房间
  leaveRoom() {
    if (!this.isConnected || !this.currentRoom) return
    
    console.log('Leaving room:', this.currentRoom)
    this.socket.emit('leave_room', { roomCode: this.currentRoom })
    this.currentRoom = null
  }

  // 开始游戏
  startGame(roomCode) {
    console.log('Starting game in room:', roomCode)
    this.socket.emit('start_game', { roomCode })
  }

  // 更新分数
  updateScore(roomCode, targetUserId, points, action) {
    this.socket.emit('update_score', {
      roomCode,
      targetUserId,
      points,
      action,
      timestamp: Date.now()
    })
  }

  // 结束游戏
  endGame(roomCode, scores) {
    this.socket.emit('end_game', {
      roomCode,
      scores
    })
  }

  // 设置房间相关监听器
  setupRoomListeners() {
    // 可以在这里添加更多特定于房间的监听器
    console.log('Room listeners set up')
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.currentRoom = null
    }
  }
}

// 创建单例
export const socketManager = new SocketManager() 