<template>
  <div class="join-room-container">
    <van-nav-bar
      title="加入房间"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="form-container">
      <div class="join-header">
        <van-icon name="friends-o" size="60" color="#667eea" />
        <h2>输入房间码</h2>
        <p>请输入6位房间码加入游戏</p>
      </div>

      <van-form @submit="handleJoinRoom">
        <van-cell-group inset>
          <van-field
            v-model="roomCode"
            name="roomCode"
            label="房间码"
            placeholder="请输入6位房间码"
            maxlength="6"
            :rules="[
              { required: true, message: '请输入房间码' },
              { len: 6, message: '房间码必须是6位' }
            ]"
          />
        </van-cell-group>

        <div class="join-actions">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
          >
            加入房间
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import { showToast } from 'vant'

const router = useRouter()
const roomStore = useRoomStore()

const roomCode = ref('')
const loading = ref(false)

const handleJoinRoom = async () => {
  if (!roomCode.value.trim()) {
    showToast('请输入房间码')
    return
  }

  loading.value = true
  try {
    const response = await roomStore.joinRoom(roomCode.value.trim().toUpperCase())
    
    console.log('加入房间成功:', response)
    showToast('成功加入房间')
    
    // 跳转到房间大厅
    router.push(`/room/${roomCode.value.trim().toUpperCase()}`)
  } catch (error) {
    console.error('加入房间失败:', error)
    
    // 根据错误类型显示不同的提示
    if (error.response?.status === 404) {
      showToast('房间不存在')
    } else if (error.response?.status === 400) {
      showToast(error.response.data.error || '加入房间失败')
    } else {
      showToast('加入房间失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.join-room-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.form-container {
  padding: 20px;
}

.join-header {
  text-align: center;
  padding: 40px 20px;
}

.join-header h2 {
  font-size: 24px;
  margin: 20px 0 10px;
  color: #323233;
}

.join-header p {
  color: #969799;
  font-size: 14px;
}

.join-actions {
  padding: 30px 16px;
}
</style> 