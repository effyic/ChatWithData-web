import { defineStore } from 'pinia'
import cache from '@/utils/cache'

const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: cache.session.get('sidebarStatus') ? !!+(cache.session.get('sidebarStatus') ?? '') : true,
      withoutAnimation: false,
      hide: false,
    },
    device: 'desktop',
    size: cache.session.get('size') || 'default',
    routerOpen:false //是否开启动态路由
  }),
  actions: {
    toggleSideBar(withoutAnimation?: boolean) {
      this.sidebar.hide = !this.sidebar.hide
      this.sidebar.withoutAnimation = Boolean(withoutAnimation)
    },
    closeSideBar({ withoutAnimation }: { withoutAnimation: boolean }) {
      cache.session.set('sidebarStatus', '0')
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },
    toggleDevice(device: string) {
      this.device = device
    },
    setSize(size: string) {
      this.size = size
      cache.session.set('size', size)
    },
    toggleSideBarHide(status: boolean) {
      this.sidebar.hide = status
    },
  },
  persist: true,

})

export default useAppStore
