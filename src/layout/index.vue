<script setup lang="ts">
import { computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { Fold, Expand } from '@element-plus/icons-vue'
import Sidebar from './components/Sidebar/index.vue'
import AppMain from './components/AppMain.vue'
import Navbar from './components/Navbar.vue'
import useAppStore from '@/stores/app'
import { useUserStore } from '@/stores/user'
import cache from "@/utils/cache";
import question from "@/api/question";
import { ref } from 'vue'

const appStore = useAppStore()
const sidebar = computed(() => useAppStore().sidebar)
const device = computed(() => useAppStore().device)
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile',
}))

const toggleSideBar = () => {
  appStore.toggleSideBar()
}

// if (!useAppStore().routerOpen && cache.local.get("token")) { //静态路由
//   useUserStore().getInfo()
// }

let timer: any = null

const fetchTabs = () => {
  question.getTabs().then(res => {
    if(!res.data){
      imageName.value = '首页'
    }else{
      imageName.value = res.data.main_tab
    }
  })
}


const clearTabs = () => {
  question.deleteTabs().then((res) => {
    if(!res.data){
      imageName.value = '首页'
    }else{
      imageName.value = res.data.main_tab
    }
    fetchTabs()
  })
}

onMounted(() => {
  clearTabs()
  timer = setInterval(fetchTabs, 3000)
})

onUnmounted(() => {
  // 组件卸载时清除定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

const imageName = ref('首页')
const imagePath = computed(() => {
  return new URL(`../assets/project/${imageName.value}.png`, import.meta.url).href
})

</script>

<template>
  <div :class="classObj" class="app-wrapper">
    <div>
      <Navbar />
    </div>
    <div style="position: relative;background: #F0F3F8;border-radius: 20px;height:calc(100vh - 96px);">
      <!-- <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" /> -->
      <div style="display: flex;height: 100%;">
        <div class="image-container" style="width: 70%;">
          <img :src="imagePath" alt="bg" style="width: 100%;height: 100%;"/>
        </div>
        <div style="display: flex;width: 30%;">
          <transition name="sidebar-fade">
            <Sidebar v-if="!sidebar.hide" class="sidebar-container" />
          </transition>
          <div class="main-container" :class="{ 'is-collapse': sidebar.hide }">
            <div class="toggle-sidebar" @click="toggleSideBar">
              <el-icon :size="17">
                <Fold v-if="!sidebar.hide"/>
                <Expand v-else/>
              </el-icon>
            </div>
            <AppMain />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/mixin.scss';
@import '@/assets/styles/variables.module.scss';

// 添加过渡动画样式
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: all 0.3s ease;
}

.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  background: linear-gradient(180deg, #3962A5 0%, #CDD8E8 100%);
  padding: 16px;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.main-container {
  position: relative;
  min-height: 100%;
  transition: all 0.3s ease;
  margin-left: 0;
  width: calc(100% - 244px);

  &.is-collapse {
    width: 100%;
  }

  .toggle-sidebar {
    position: absolute;
    left: 10px;
    top: 10px;
    width: 24px;
    height: 24px;
    background-color: #fff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    z-index: 100;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    .el-icon {
      color: #909399;
    }
  }
}
</style>
