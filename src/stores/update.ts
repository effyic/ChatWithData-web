import { defineStore } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'
import FeedbackService from '@/api/feedback'

export interface UpdateInfo {
    version_number: string
    content: string
    created_at: string
    read: boolean
    id: number | null
}

export const useUpdateStore = defineStore('update', () => {
  const updateDialog = ref(false)
  const updateInfo = ref<UpdateInfo>({
      version_number: '',
      content: '',
      created_at: '',
      read: false,
      id: null
  })

  let timer: number | null = null

  const checkVersion = () => {
    FeedbackService.getVersionInfo().then((res:any) => {
      updateInfo.value = res.data?.latest_version
      if(!updateInfo.value.read){
        updateDialog.value = true
      }
    })
  }

  const startPolling = () => {
    if(localStorage.getItem('token')){
      checkVersion()
      timer = window.setInterval(checkVersion, 10000)
    }
  }

  const stopPolling = () => {
    if (timer) {
      window.clearInterval(timer)
      timer = null
    }
  }

  // 组件卸载时清除定时器
  onUnmounted(() => {
    stopPolling()
  })

  return {
    updateDialog,
    updateInfo,
    startPolling,
    stopPolling
  }
}) 