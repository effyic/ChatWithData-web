<script setup lang="ts">
import { onMounted } from 'vue'
import { useUpdateStore } from '@/stores/update'
import VersionUpdateDialog from '@/components/VersionUpdateDialog/index.vue'

const updateStore = useUpdateStore()

onMounted(() => {
  // updateStore.startPolling()
})
</script>

<template>
  <RouterView />
  <VersionUpdateDialog />
</template>

<style>
.el-popper.el-dropdown__popper .el-dropdown-menu {
  padding: 0;
}

.el-popper.el-dropdown__popper .el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
}

.el-popper.el-dropdown__popper .el-dropdown-menu__item .el-icon {
  display: inline-block;
  font-size: 16px;
  color: #3C3C3C;
  font-weight: bold;
}

.el-popper.el-dropdown__popper .el-dropdown-menu__item span {
  display: inline-block;
  color: #575C61;
  font-size: 12px;
}

.el-popper.el-dropdown__popper .el-dropdown-menu__item:hover {
  background-color: #F5F7FA;
}
</style>
