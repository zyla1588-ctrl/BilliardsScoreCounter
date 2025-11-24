<template>
  <div class="game-screen">
    <van-nav-bar
      :title="`游戏中 - ${roomCode}`"
      left-text="退出"
      left-arrow
      @click-left="handleExitGame"
    />

    <!-- 玩家分数面板 -->
    <div class="score-panel">
      <div
        v-for="player in players"
        :key="player.id"
        class="player-score"
        :class="{ active: selectedPlayer === player.id }"
        @click="selectPlayer(player.id)"
      >
        <div class="player-avatar">
          {{ player.username.substring(0, 1) }}
        </div>
        <div class="player-name">{{ player.username }}</div>
        <div class="player-points">{{ getPlayerScore(player.id) }}</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons" v-if="selectedPlayer">
      <div class="selected-info">
        <span>为 {{ getPlayerName(selectedPlayer) }} 计分</span>
      </div>
      <van-row gutter="12">
        <van-col span="12">
          <van-button 
            block 
            type="success" 
            @click="addScore(1)"
            size="large"
            class="score-btn"
          >
            1分
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button 
            block 
            type="primary" 
            @click="addScore(4)"
            size="large"
            class="score-btn"
          >
            4分普盛
          </van-button>
        </van-col>
      </van-row>
      <van-row gutter="12" style="margin-top: 12px;">
        <van-col span="12">
          <van-button 
            block 
            type="warning" 
            @click="addScore(7)"
            size="large"
            class="score-btn"
          >
            7分小金
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button 
            block 
            type="danger" 
            @click="addScore(10)"
            size="large"
            class="score-btn"
          >
            10分大金
          </van-button>
        </van-col>
      </van-row>
    </div>

    <!-- 游戏记录 -->
    <div class="game-logs">
      <h3>游戏记录</h3>
      <div class="log-list">
        <div
          v-for="log in gameLogs"
          :key="log.id"
          class="log-item"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-content">{{ log.message }}</span>
        </div>
        <div v-if="gameLogs.length === 0" class="no-logs">
          暂无记录
        </div>
      </div>
    </div>

    <!-- 结束游戏按钮 -->
    <div class="end-game-section">
      <van-button
        v-if="isRoomCreator"
        round
        block
        type="danger"
        @click="handleEndGame"
      >
        结束游戏
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { socketManager } from '@/utils/socket'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const gameStore = useGameStore()
const userStore = useUserStore()

const roomCode = ref(route.params.code)
const selectedPlayer = ref(null)
const players = ref([])

const gameLogs = computed(() => gameStore.gameLogs)

const isRoomCreator = computed(() => {
  return roomStore.currentRoom?.creator_id === userStore.user?.id
})

const getPlayerScore = (playerId) => {
  return gameStore.playerScores[playerId] || 0
}

const getPlayerName = (playerId) => {
  const player = players.value.find(p => p.id === playerId)
  return player ? player.username : '未知玩家'
}

const selectPlayer = (playerId) => {
  selectedPlayer.value = selectedPlayer.value === playerId ? null : playerId
}

const addScore = async (points) => {
  if (!selectedPlayer.value) {
    showToast('请先选择玩家')
    return
  }

  try {
    // 通过 Socket 发送分数更新
    socketManager.updateScore(
      roomCode.value,
      selectedPlayer.value,
      points,
      points > 0 ? '得分' : '失分'
    )

    // 本地立即更新分数（乐观更新）
    const currentScore = getPlayerScore(selectedPlayer.value)
    gameStore.updateScore(selectedPlayer.value, currentScore + points)

    showToast(`${points > 0 ? '+' : ''}${points}分`)
  } catch (error) {
    console.error('更新分数失败:', error)
    showToast('更新分数失败')
  }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const handleExitGame = async () => {
  try {
    await showConfirmDialog({
      title: '确认离开',
      message: '确定要离开房间吗？',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })
    
    socketManager.leaveRoom()
    router.push('/home')
  } catch (error) {
    // 用户取消，不做任何操作
    console.log('用户取消离开')
  }
}

const handleEndGame = async () => {
  try {
    await showConfirmDialog({
      title: '确认结束',
      message: '确定要结束游戏吗？结束后将返回首页。',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })
    
    // 通知所有玩家游戏结束
    socketManager.endGame(roomCode.value, gameStore.playerScores)
    
    showToast('游戏已结束')
    
    // 重置游戏状态并返回首页
    gameStore.resetGame()
    router.push('/home')
  } catch (error) {
    // 用户取消，不做任何操作
    console.log('用户取消结束游戏')
  }
}

onMounted(async () => {
  try {
    // 确保 Socket 连接
    if (!socketManager.isConnected) {
      socketManager.connect()
    }

    // 获取房间信息
    if (!roomStore.currentRoom) {
      await roomStore.fetchRoomInfo(roomCode.value)
    }

    // 初始化游戏状态
    gameStore.updateGameStatus('playing')
    
    // 加入游戏房间
    socketManager.joinRoom(roomCode.value, userStore.user.id)

    // 监听 Socket 事件
    socketManager.socket?.on('room_joined', (data) => {
      console.log('Players updated:', data.players)
      players.value = data.players
      
      // 初始化所有玩家分数
      data.players.forEach(player => {
        gameStore.updateScore(player.id, player.score || 0)
      })
    })

    socketManager.socket?.on('score_updated', (data) => {
      console.log('Score updated:', data)
      
      // 更新所有玩家分数
      if (data.players) {
        data.players.forEach(player => {
          gameStore.updateScore(player.id, player.score)
        })
      }
      
      // 添加日志
      gameStore.addLog({
        id: Date.now(),
        message: data.message,
        timestamp: data.timestamp,
        operatorId: data.operatorId,
        targetId: data.targetId,
        points: data.points
      })
    })

    socketManager.socket?.on('game_ended', () => {
      showToast('游戏已结束')
      gameStore.resetGame()
      router.push('/home')
    })

  } catch (error) {
    console.error('加载游戏失败:', error)
    showToast('加载游戏失败')
    router.push('/home')
  }
})

onUnmounted(() => {
  socketManager.leaveRoom()
})
</script>

<style scoped>
.game-screen {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.score-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  padding: 20px;
}

.player-score {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.player-score.active {
  border-color: #1989fa;
  background: #e8f4ff;
}

.player-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin: 0 auto 12px;
}

.player-name {
  font-size: 14px;
  color: #323233;
  margin-bottom: 4px;
}

.player-points {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
}

.action-buttons {
  padding: 20px;
  margin-bottom: 20px;
}

.selected-info {
  text-align: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.score-btn {
  height: 50px;
  font-size: 16px;
  font-weight: bold;
}

.game-logs {
  margin: 20px;
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.game-logs h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #323233;
}

.log-list {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #969799;
  min-width: 50px;
}

.log-content {
  color: #323233;
  flex: 1;
  text-align: right;
}

.no-logs {
  text-align: center;
  color: #969799;
  padding: 20px;
}

.end-game-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: white;
  border-top: 1px solid #ebedf0;
}
</style> 
