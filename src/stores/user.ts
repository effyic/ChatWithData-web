import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import cache from '@/utils/cache'
import LoginService from '@/api/login'
import type {  UserInfo } from '@/types/user'
import { computed, ref, watchEffect } from 'vue'

export const useUserStore = defineStore('user', () => {
  const timer = computed(() => {
    return localStorage.getItem('timer')
  })
  const loginDialog = ref(false)
  const currentUser = ref<UserInfo>({} as UserInfo)
  const token = ref<string>('')
  
  watchEffect(() => {
    const user = JSON.parse(String(localStorage.getItem('userInfo'))) as unknown as UserInfo
    if (user?.Mobile)
      currentUser.value = user
    else
      currentUser.value = {} as UserInfo


  })

  // 获取用户信息
  function getInfo() {
    return LoginService.userInfo().then((res) => {
      const data = {
        id: res.data.id,
        Mobile: res.data.Mobile,//账号
        State: res.data.State,
        Nickname: res.data.Nickname,
        Password: res.data.Password,//角色
      }
      currentUser.value = data as UserInfo
      cache.local.setJSON('userInfo', data)
      return Promise.resolve(res)
    })
  }


  return {
    getInfo,
    loginDialog,
    timer,
    token,
    currentUser
  }
})
