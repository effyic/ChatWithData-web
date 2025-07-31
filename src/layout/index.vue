<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Fold, Expand } from '@element-plus/icons-vue'
import Sidebar from './components/Sidebar/index.vue'
import AppMain from './components/AppMain.vue'
import Navbar from './components/Navbar.vue'
import useAppStore from '@/stores/app'
import { useUserStore } from '@/stores/user'
import cache from "@/utils/cache";
import question from "@/api/question";

const appStore = useAppStore()
const sidebar = computed(() => useAppStore().sidebar)
const device = computed(() => useAppStore().device)
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile',
}))

const dialogVisible = ref(false)

const toggleSideBar = () => {
  dialogVisible.value = !dialogVisible.value
  // appStore.toggleSideBar()
}

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
  // timer = setInterval(fetchTabs, 3000)
})

onUnmounted(() => {
  // 组件卸载时清除定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

const imageName = ref('首页')

</script>

<template>
  <div :class="classObj" class="app-wrapper">
    <div>
      <Navbar />
    </div>
    <div style="position: relative;background: #F0F3F8;border-radius: 20px;height:calc(100vh - 96px);">
      <div style="height: 100%;">
        <div class="image-container" style="width: 100%;height: 100%;">
          <img src="@/assets/images/overview.png" alt="bg" style="width: 100%;"/>
          <div class="toggle-button" @click="toggleSideBar">
            <el-icon :size="17">
              <ChatDotRound />
              <!-- <Expand v-if="!dialogVisible"/>
              <Fold v-else/> -->
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      custom-class="right-dialog"
      :show-close="false"
      :modal="true"
      :close-on-click-modal="true"
      :destroy-on-close="false"
      append-to-body
    >
      <div style="display: flex;height: 100%;">
        <transition name="sidebar-fade">
          <Sidebar v-if="!sidebar.hide" class="sidebar-container" />
        </transition>
        <div class="main-container" :class="{ 'is-collapse': sidebar.hide }">
          <AppMain />
        </div>
      </div>
    </el-dialog>
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
  // background: linear-gradient(180deg, #3962A5 0%, #CDD8E8 100%);
  // padding: 16px;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.toggle-button {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background-color: #f5f7fa;
    transform: translateY(-50%) scale(1.05);
  }

  .el-icon {
    color: #909399;
  }
}

.main-container {
  position: relative;
  min-height: 100%;
  transition: all 0.3s ease;
  margin-left: 0;
  //width: calc(100% - 244px);
  width: calc(100% - 204px);
  //width: calc(100% - 0px);

  &.is-collapse {
    width: 100%;
  }
}

:deep(.right-dialog) {
  margin: 0 0 0 auto !important;
  height: 100% !important;
  width: 30% !important;
  background: #F0F3F8;


  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    height: 100%;
    padding: 0;
  }
}

.image-container {
  position: relative;
  height: 100%;

  img {
    object-fit: contain;
  }
}

</style>
<style>
.el-dialog{
  width: 80% !important;
  height: 80% !important;
  --el-dialog-margin-top:10vh;
}
</style>
