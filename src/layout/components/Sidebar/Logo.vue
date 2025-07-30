<script setup lang="ts">
import { ref } from 'vue'
import logo from '@/assets/logo/logo.png'
import useAppStore from '@/stores/app';
import Hamburger from '@/components/Hamburger/index.vue';

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
})
const appStore = useAppStore();


function toggleSideBar() {
  appStore.toggleSideBar();
}
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapse }">
    <transition name="sidebarLogoFade">
      <div v-if="collapse" class="sidebar-box">
        <div class="sidebar-logo-link">
          <svg-icon v-if="!logo" class="sidebar-title" name="DataMaster" width="102px" height="48px" />
          <el-tooltip v-else effect="light" content="展开" placement="right-start">
            <hamburger :is-active="appStore.sidebar.opened" @toggleClick="toggleSideBar" />
          </el-tooltip>

        </div>
      </div>
      <div v-else class="sidebar-box">
        <div class="sidebar-logo-link">
          <svg-icon class="sidebar-title" name="DataMaster" width="102px" height="48px" />
          <el-tooltip v-if="logo" effect="light" content="收起" placement="right-start">
            <hamburger :is-active="appStore.sidebar.opened" @toggleClick="toggleSideBar" />
          </el-tooltip>
        </div>
      </div>

    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #fff;
  text-align: center;
  overflow: hidden;

  .sidebar-box {
    height: 100%;
    margin: 0 16px;
    border-bottom: 1px solid;
  }

  .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex !important;
    align-items: center;
    justify-content: space-between;



    .sidebar-title {
      display: inline-block;
      margin: 0 !important;
      width: 119px;
      height: 25px;

    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
