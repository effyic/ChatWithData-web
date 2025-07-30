<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import questionList from './questionList.vue'
import variables from '@/assets/styles/variables.module.scss'
import usePermissionStore from '@/stores/permission'
import useAppStore from '@/stores/app'
import { constantRoutes } from '@/router';
import FeedbackDialog from '@/components/FeedbackDialog/index.vue'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

const sidebarRouters = computed(() => {
  if (!appStore.routerOpen) {
    return constantRoutes.find(item => item.name === 'home')?.children
  } else {
    return permissionStore.sidebarRouters.find(item => item.name === 'home')?.children
  }
})
const isCollapse = computed(() => !appStore.sidebar.opened)
const activeMenu = computed(() => {
  const { name, path } = route
  if (name)
    return name

  return path
})

const feedbackDialogRef = ref()
function showFeedback() {
  feedbackDialogRef.value?.open()
}
</script>

<template>
  <div class="has-logo">
    <!-- <Logo :collapse="isCollapse" /> -->
    <el-scrollbar wrap-class="scrollbar-wrapper" style="padding: 0 8px;">
      <el-menu :default-active="activeMenu" router :unique-opened="true" :collapse="isCollapse"
        :collapse-transition="false" :text-color="variables.menuColor" mode="vertical">
        <SidebarItem v-for="(routeItem, index) in sidebarRouters" :key="routeItem.path + index" :item="routeItem"
          :base-path="routeItem.path" />
      </el-menu>
    </el-scrollbar>
    <div class="question-list">
      <questionList :collapse="isCollapse" />
    </div>
    <!-- <div class="menuList">
      <div class="menuItem" @click="showFeedback">
        <img src="@/assets/images/feedback.png" alt="反馈">
        意见反馈
      </div>
      <div class="menuItem" @click="router.push({ path: '/helpCenter' })">
        <img src="@/assets/images/helpcenter.png" alt="反馈">
        帮助中心
      </div>
    </div> -->

    <FeedbackDialog ref="feedbackDialogRef" />
  </div>
</template>
<style scoped lang="scss">
:deep(.el-scrollbar) {
  height: auto !important;
}

:deep(.el-menu) {
  background: none;
}

.question-list {
  flex: 1;
  padding: 18px 8px 8px 8px;
  overflow-y: auto;
}

.menuList {
  width: 100%;
  padding: 20px 8px;

  .menuItem {
    cursor: pointer;
    width: 100%;
    height: 40px;
    background-color: #F2F3F5;
    border-radius: 10px;
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 18px;
    color: #000000;
    padding: 0 8px;
    margin-bottom: 8px;

    img {
      width: 20px;
      height: 20px;
      margin-right: 6px;
    }
  }
}
</style>
