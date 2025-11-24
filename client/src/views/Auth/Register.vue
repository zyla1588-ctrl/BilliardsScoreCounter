<template>
  <div class="register-container">
    <div class="logo-section">
      <van-icon name="gem-o" size="60" color="#667eea" />
      <h1>台球计分</h1>
      <p>注册新账号</p>
    </div>

    <van-form @submit="handleRegister">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <van-field
          v-model="form.nickname"
          name="nickname"
          label="昵称"
          placeholder="请输入昵称（可选）"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
        <van-field
          v-model="form.confirmPassword"
          type="password"
          name="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: validatePasswordMatch, message: '两次密码不一致' }
          ]"
        />
      </van-cell-group>
      <div class="register-btn">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          注册
        </van-button>
      </div>
    </van-form>

    <div class="login-link">
      已有账号？<router-link to="/login">立即登录</router-link>
    </div>
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
  nickname: '',
  password: '',
  confirmPassword: ''
})

const validatePasswordMatch = (val) => {
  return val === form.value.password
}

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    showToast('两次密码不一致')
    return
  }

  loading.value = true
  try {
    await userStore.register({
      username: form.value.username,
      password: form.value.password,
      nickname: form.value.nickname || form.value.username // 如果未填写昵称，使用用户名
    })
    showToast('注册成功')
    router.push('/home')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.logo-section {
  text-align: center;
  padding: 40px 0;
}

.logo-section h1 {
  font-size: 28px;
  margin: 16px 0 8px;
  color: #323233;
}

.logo-section p {
  color: #969799;
  font-size: 16px;
}

.register-btn {
  margin: 30px 16px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #969799;
}

.login-link a {
  color: #1989fa;
  text-decoration: none;
}
</style> 