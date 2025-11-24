import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/api/request'

export const useGameStore = defineStore('game', () => {
  const gameStatus = ref('waiting')
  const playerScores = ref({})
  const gameLogs = ref([])
  const currentGame = ref(null)

  const updateGameStatus = (status) => {
    gameStatus.value = status
  }

  const updateScore = (userId, score) => {
    playerScores.value[userId] = score
  }

  const addScore = async (data) => {
    try {
      const response = await request.post('/game/add-score', data)
      
      // 更新本地分数
      if (response.newScore !== undefined) {
        playerScores.value[data.userId] = response.newScore
      }
      
      return response
    } catch (error) {
      console.error('添加分数失败:', error)
      throw error
    }
  }

  const addLog = (log) => {
    gameLogs.value.unshift({
      ...log,
      id: Date.now(),
      timestamp: log.timestamp || Date.now()
    })
  }

  const endGame = async (roomId) => {
    try {
      const response = await request.post('/game/end', { roomId })
      gameStatus.value = 'ended'
      return response
    } catch (error) {
      console.error('结束游戏失败:', error)
      throw error
    }
  }

  const resetGame = () => {
    gameStatus.value = 'waiting'
    playerScores.value = {}
    gameLogs.value = []
    currentGame.value = null
  }

  // 简化的获取游戏日志函数，不依赖后端
  const fetchGameLogs = async (roomId) => {
    try {
      // 暂时返回空数组，避免请求失败
      gameLogs.value = []
      return { logs: [] }
    } catch (error) {
      console.error('获取游戏日志失败:', error)
      // 不抛出错误，返回空数组
      gameLogs.value = []
      return { logs: [] }
    }
  }

  return {
    gameStatus,
    playerScores,
    gameLogs,
    currentGame,
    updateGameStatus,
    updateScore,
    addScore,
    addLog,
    endGame,
    resetGame,
    fetchGameLogs
  }
}) 