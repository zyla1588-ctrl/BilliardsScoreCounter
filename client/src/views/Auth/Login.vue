<template>
  <div class="login-container">
    <div class="login-header">
      <h1>台球计分器</h1>
      <p>欢迎回来</p>
    </div>

    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>

      <div class="login-actions">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          登录
        </van-button>
        
        <van-button
          round
          block
          plain
          type="primary"
          @click="$router.push('/register')"
          class="register-btn"
        >
          注册账号
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  console.log('准备登录，表单数据:', form.value)
  try {
    const result = await userStore.login(form.value)
    console.log('登录成功，返回数据:', result)
    showToast('登录成功')
    router.push('/home')
  } catch (error) {
    console.error('登录失败，完整错误:', error)
    // 不要刷新页面，只显示错误
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  padding: 60px 20px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-header {
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.login-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: bold;
}

.login-header p {
  font-size: 16px;
  opacity: 0.8;
}

.login-actions {
  padding: 30px 16px;
}

.register-btn {
  margin-top: 16px;
}
</style> 