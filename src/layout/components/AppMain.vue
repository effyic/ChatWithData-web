<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <component v-if="!route.meta.link" :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </section>
</template>

<script setup lang="ts">


</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  //height: calc(100vh - 96px);
  height: 100%;
  width: 100%;
  position: relative;
  overflow-y: auto;
}

.fixed-header+.app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    height: calc(100vh - 84px);
  }

  .fixed-header+.app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 17px;
  }
}
</style>
