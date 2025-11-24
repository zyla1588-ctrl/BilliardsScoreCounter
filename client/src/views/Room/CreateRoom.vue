<template>
  <div class="create-room-container">
    <van-nav-bar
      title="创建房间"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="form-container">
      <van-form @submit="handleCreateRoom">
        <van-cell-group inset>
          <van-field
            v-model="form.name"
            name="name"
            label="房间名称"
            placeholder="请输入房间名称"
            :rules="[{ required: true, message: '请输入房间名称' }]"
          />
          
          <van-field
            name="maxPlayers"
            label="最大人数"
            readonly
            clickable
            :value="`${form.maxPlayers}人`"
            @click="showPlayerPicker = true"
          />
        </van-cell-group>

        <div class="create-actions">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
          >
            创建房间
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 人数选择器 -->
    <van-popup v-model:show="showPlayerPicker" position="bottom">
      <van-picker
        :columns="playerOptions"
        @confirm="onPlayerConfirm"
        @cancel="showPlayerPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import { showToast } from 'vant'

const router = useRouter()
const roomStore = useRoomStore()

const form = ref({
  name: '',
  maxPlayers: 4
})

const showPlayerPicker = ref(false)
const playerOptions = [
  { text: '2人', value: 2 },
  { text: '3人', value: 3 },
  { text: '4人', value: 4 },
  { text: '5人', value: 5 },
  { text: '6人', value: 6 },
  { text: '7人', value: 7 },
  { text: '8人', value: 8 }
]

const loading = ref(false)

const onPlayerConfirm = ({ selectedOptions }) => {
  form.value.maxPlayers = selectedOptions[0].value
  showPlayerPicker.value = false
}

const handleCreateRoom = async () => {
  if (!form.value.name.trim()) {
    showToast('请输入房间名称')
    return
  }

  loading.value = true
  try {
    const response = await roomStore.createRoom({
      name: form.value.name,
      max_players: parseInt(form.value.maxPlayers)
    })
    
    console.log('创建房间成功:', response)
    console.log('房间信息:', response.room)
    
    showToast('房间创建成功')
    
    // 跳转到房间大厅
    router.push(`/room/${response.room.code}`)
  } catch (error) {
    console.error('创建房间失败:', error)
    showToast('创建房间失败')
  } finally {
    loading.value = false
  }
}
</script>