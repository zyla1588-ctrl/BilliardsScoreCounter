import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/api/request'
import { useUserStore } from './user'

export const useRoomStore = defineStore('room', () => {
  const currentRoom = ref(null)
  const rooms = ref([])

  const createRoom = async (roomData) => {
    try {
      const response = await request.post('/rooms', roomData)
      
      // 确保房间数据完整
      if (response.room) {
        currentRoom.value = response.room
        console.log('Store中保存的房间信息:', currentRoom.value)
        console.log('房间创建者ID:', currentRoom.value.creator_id)
      }
      
      return response
    } catch (error) {
      console.error('创建房间失败:', error)
      throw error
    }
  }

  const joinRoom = async (code) => {
    try {
      const response = await request.post(`/rooms/${code}/join`)
      currentRoom.value = response.room
      return response
    } catch (error) {
      console.error('加入房间失败:', error)
      throw error
    }
  }

  const fetchRoomInfo = async (code) => {
    try {
      const response = await request.get(`/rooms/${code}`)
      currentRoom.value = response.room
      
      console.log('获取到的房间信息:', response.room)
      console.log('房间创建者ID:', response.room?.creator_id)
      
      return response
    } catch (error) {
      console.error('获取房间信息失败:', error)
      throw error
    }
  }

  const leaveRoom = async () => {
    try {
      if (currentRoom.value) {
        await request.post(`/rooms/${currentRoom.value.code}/leave`)
      }
      currentRoom.value = null
    } catch (error) {
      console.error('离开房间失败:', error)
      throw error
    }
  }

  const startGame = async () => {
    try {
      if (currentRoom.value) {
        const response = await request.post(`/rooms/${currentRoom.value.code}/start`)
        return response
      }
    } catch (error) {
      console.error('开始游戏失败:', error)
      throw error
    }
  }

  const clearCurrentRoom = () => {
    currentRoom.value = null
  }

  const updateRoom = (roomData) => {
    currentRoom.value = { ...currentRoom.value, ...roomData }
  }

  const updatePlayers = (players) => {
    rooms.value = players
  }

  const roomInfo = () => currentRoom.value
  const playerList = () => rooms.value
  const isRoomCreator = (userId) => {
    const result = currentRoom.value?.creator_id === userId
    console.log('检查房主权限:', {
      currentRoomCreatorId: currentRoom.value?.creator_id,
      userId,
      isCreator: result
    })
    return result
  }

  return {
    currentRoom,
    rooms,
    createRoom,
    joinRoom,
    fetchRoomInfo,
    leaveRoom,
    startGame,
    clearCurrentRoom,
    updateRoom,
    updatePlayers,
    roomInfo,
    playerList,
    isRoomCreator
  }
}) 