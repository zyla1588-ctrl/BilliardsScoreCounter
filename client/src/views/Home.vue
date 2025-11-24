<template>
  <div class="home-container">
    <van-nav-bar title="台球计分器" />
    
    <div class="welcome-section">
      <h2>欢迎, {{ userStore.user?.username }}</h2>
      <p>选择一个选项开始游戏</p>
    </div>

    <div class="action-cards">
      <van-cell-group inset>
        <van-cell
          title="创建房间"
          label="创建一个新的游戏房间"
          is-link
          @click="$router.push('/create-room')"
        >
          <template #icon>
            <van-icon name="plus" />
          </template>
        </van-cell>
        
        <van-cell
          title="加入房间"
          label="通过房间码加入游戏"
          is-link
          @click="$router.push('/join-room')"
        >
          <template #icon>
            <van-icon name="friends" />
          </template>
        </van-cell>
        
        
      </van-cell-group>
    </div>

    <div class="logout-section">
      <van-button
        round
        block
        plain
        type="danger"
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  showToast('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.welcome-section {
  padding: 40px 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-section h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.welcome-section p {
  opacity: 0.8;
}

.action-cards {
  padding: 20px;
}

.logout-section {
  padding: 20px;
  margin-top: 40px;
}
</style> 