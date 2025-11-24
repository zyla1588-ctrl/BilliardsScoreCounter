<template>
  <div class="lobby-container">
    <van-nav-bar
      :title="`房间 ${roomCode}`"
      left-text="离开"
      left-arrow
      @click-left="handleLeaveRoom"
    >
      <template #right>
        <van-button 
          size="small" 
          type="primary" 
          @click="copyRoomCode"
        >
          复制房间码
        </van-button>
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-overlay" />

    <!-- 房间信息 -->
    <div class="room-info" v-if="room">
      <van-cell-group inset>
        <van-cell title="房间名称" :value="room.name" />
        <van-cell title="房间码" :value="roomCode" />
        <van-cell title="最大人数" :value="`${room.max_players}人`" />
        <van-cell title="当前人数" :value="`${players.length}人`" />
        <van-cell title="房间状态" :value="room.status === 'waiting' ? '等待中' : '游戏中'" />
        <van-cell title="房主" :value="isRoomCreator ? '您是房主' : '其他玩家'" />
      </van-cell-group>
    </div>

    <!-- 玩家列表 -->
    <div class="players-section">
      <h3>玩家列表</h3>
      <van-cell-group inset>
        <van-cell
          v-for="player in players"
          :key="player.id"
          :title="player.username"
          :label="getPlayerLabel(player)"
        >
          <template #icon>
            <div class="player-avatar" :class="{ 'creator-avatar': player.id === room?.creator_id }">
              {{ player.username.substring(0, 1) }}
            </div>
          </template>
          <template #right-icon>
            <!-- 房主标识 -->
            <van-icon
              v-if="player.id === room?.creator_id"
              name="crown-o"
              color="#ffd700"
              size="20"
            />
            <!-- 踢出按钮 -->
            <van-button
              v-else-if="isRoomCreator && player.id !== userStore.user?.id"
              size="mini"
              type="danger"
              @click="handleKickPlayer(player.id, player.username)"
              style="margin-left: 8px;"
            >
              踢出
            </van-button>
          </template>
        </van-cell>
        
        <van-empty 
          v-if="players.length === 0" 
          description="暂无玩家"
          image="search"
        />
      </van-cell-group>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <van-button
        v-if="isRoomCreator"
        round
        block
        type="primary"
        size="large"
        :disabled="!canStartGame"
        :loading="loading"
        @click="handleStartGame"
      >
        {{ canStartGame ? '开始游戏' : `至少需要2名玩家 (${players.length}/2)` }}
      </van-button>
      
      <van-button
        v-else
        round
        block
        type="default"
        size="large"
        disabled
      >
        等待房主开始游戏...
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import { useUserStore } from '@/stores/user'
import { socketManager } from '@/utils/socket'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const userStore = useUserStore()

const roomCode = ref(route.params.code)
const room = computed(() => roomStore.currentRoom)
const players = ref([])
const loading = ref(false)

// 检查是否是房主 - 确保用户信息存在
const isRoomCreator = computed(() => {
  if (!room.value || !userStore.user) {
    return false
  }
  return room.value.creator_id === userStore.user.id
})

// 检查是否可以开始游戏
const canStartGame = computed(() => {
  return players.value.length >= 2 && isRoomCreator.value
})

// 获取当前用户在玩家列表中的信息
const currentUserInPlayers = computed(() => {
  if (!userStore.user) return null
  return players.value.find(p => p.id === userStore.user.id)
})

const handleLeaveRoom = async () => {
  try {
    await showConfirmDialog({
      title: '确认离开',
      message: '确定要离开房间吗？',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })
    
    loading.value = true
    
    // 通过 Socket 离开房间
    socketManager.leaveRoom()
    
    // 清除房间状态
    roomStore.clearCurrentRoom()
    
    showToast('已离开房间')
    router.push('/home')
  } catch (error) {
    // 用户取消，不做任何操作
    console.log('用户取消离开房间')
  } finally {
    loading.value = false
  }
}

const handleStartGame = async () => {
  if (!canStartGame.value) {
    showToast('至少需要2名玩家才能开始游戏')
    return
  }

  try {
    await showConfirmDialog({
      title: '开始游戏',
      message: '确定要开始游戏吗？',
      confirmButtonText: '开始',
      cancelButtonText: '取消',
      confirmButtonColor: '#07c160'
    })
    
    loading.value = true
    
    // 通过 Socket 开始游戏
    socketManager.startGame(roomCode.value)
    
    showToast('游戏开始！')
    router.push(`/game/${roomCode.value}`)
  } catch (error) {
    // 用户取消，不做任何操作
    console.log('用户取消开始游戏')
  } finally {
    loading.value = false
  }
}

const handleKickPlayer = async (playerId, playerName) => {
  if (!isRoomCreator.value) {
    showToast('只有房主可以踢出玩家')
    return
  }

  try {
    await showConfirmDialog({
      title: '踢出玩家',
      message: `确定要踢出玩家 ${playerName} 吗？`,
      confirmButtonText: '踢出',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })
    
    // 通过 Socket 踢出玩家
    socketManager.kickPlayer(roomCode.value, playerId)
    
    showToast(`已踢出玩家 ${playerName}`)
  } catch (error) {
    // 用户取消，不做任何操作
    console.log('用户取消踢出玩家')
  }
}

const copyRoomCode = async () => {
  try {
    await navigator.clipboard.writeText(roomCode.value)
    showToast('房间码已复制到剪贴板')
  } catch (error) {
    // 降级方案：创建临时输入框复制
    const textArea = document.createElement('textarea')
    textArea.value = roomCode.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showToast('房间码已复制到剪贴板')
  }
}

// 添加获取玩家标签的方法
const getPlayerLabel = (player) => {
  if (player.id === room.value?.creator_id) {
    return '房主'
  }
  if (player.id === userStore.user?.id) {
    return '我'
  }
  return '玩家'
}

onMounted(async () => {
  try {
    loading.value = true
    
    // 确保用户已登录
    if (!userStore.user) {
      showToast('请先登录')
      router.push('/login')
      return
    }
    
    // 确保 Socket 连接
    if (!socketManager.isConnected) {
      socketManager.connect()
    }

    // 获取房间信息
    await roomStore.fetchRoomInfo(roomCode.value)
    
    // 检查房间是否存在
    if (!room.value) {
      showToast('房间不存在')
      router.push('/home')
      return
    }
    
    console.log('房间信息:', room.value)
    console.log('当前用户:', userStore.user)
    console.log('是否是房主:', isRoomCreator.value)
    
    // 加入房间
    socketManager.joinRoom(roomCode.value, userStore.user.id)

    // 监听 Socket 事件
    socketManager.socket?.on('room_joined', (data) => {
      console.log('Player joined:', data)
      players.value = data.players
      showToast(data.message)
    })

    socketManager.socket?.on('room_left', (data) => {
      console.log('Player left:', data)
      players.value = data.players
      showToast(data.message)
    })

    socketManager.socket?.on('game_started', (data) => {
      showToast('游戏开始！')
      router.push(`/game/${roomCode.value}`)
    })

    socketManager.socket?.on('player_kicked', (data) => {
      if (data.kickedUserId === userStore.user.id) {
        showToast('您已被踢出房间')
        router.push('/home')
      } else {
        players.value = data.players
        showToast(data.message)
      }
    })

    socketManager.socket?.on('error', (data) => {
      showToast(data.message)
    })

  } catch (error) {
    console.error('加载房间失败:', error)
    showToast('加载房间失败')
    router.push('/home')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  // 清理 Socket 监听器
  if (socketManager.socket) {
    socketManager.socket.off('room_joined')
    socketManager.socket.off('room_left')
    socketManager.socket.off('game_started')
    socketManager.socket.off('player_kicked')
    socketManager.socket.off('error')
  }
})
</script>

<style scoped>
.lobby-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 100px;
}

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.room-info {
  margin: 20px 0;
}

.players-section {
  margin: 20px 0;
}

.players-section h3 {
  font-size: 16px;
  margin: 0 16px 12px;
  color: #323233;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-right: 12px;
}

.creator-avatar {
  background: #ffd700;
  color: #333;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: white;
  border-top: 1px solid #ebedf0;
}
</style> 