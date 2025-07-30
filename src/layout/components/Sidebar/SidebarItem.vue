<script setup lang="ts">
import { ref } from 'vue'
import { useQuestionStore } from '@/stores/question'
const QuestionStore = useQuestionStore()

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
  basePath: {
    type: String,
    default: '',
  },

})

const onlyOneChild = ref<any>({})

function handleClick(name: string) {
  QuestionStore.idIndex = 0
  if (name === 'Question') {
    QuestionStore.NewSession()
  }
}

function hasOneShowingChild(children: any[] = [], parent: any) {
  if (!children)
    children = []

  const showingChildren = children.filter((item) => {
    if (item.hidden) {
      return false
    }
    else {
      onlyOneChild.value = item
      return true
    }
  })
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }
  return false
}

function hasTitle(title: any) {
  if (title.length > 5)
    return title
  else
    return ''
}
</script>

<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children, item)
    && (!onlyOneChild.children || onlyOneChild.noShowingChildren)
    ">
      <el-menu-item @click="handleClick(item.name)" :index="item.path" :route="{ name: item.name }"
        :class="{ 'sub-menu-title-noDropdown': !isNest }">
        <svg-icon :name="(item.meta && item.meta.icon)" width="32px" height="32px" />
        <template #title>
          <div class="menu-icon">
            <span class="menu-title" :title="hasTitle(onlyOneChild.meta.title)">{{
    onlyOneChild.meta.title
  }}</span>
            <el-tooltip v-if="item.name === 'Question'" effect="light" content="新会话" placement="right-start">
              <svg-icon name="Newquestion" width="20px" height="20px" style="margin: 0;" />
            </el-tooltip>

          </div>

        </template>

      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="item.path" popper-append-to-body>
      <template v-if="item.meta" #title>
        <svg-icon :name="item.meta && item.meta.icon" width="32px" height="32px" />
        <span class="menu-title" :title="hasTitle(item.meta.title)">{{ item.meta.title }}</span>
      </template>

      <sidebar-item v-for="child in item.children" :key="child.path" :is-nest="true" :item="child"
        :base-path="child.path" class="nest-menu" />
    </el-sub-menu>
  </div>
</template>
