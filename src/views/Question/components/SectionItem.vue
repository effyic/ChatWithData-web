<template>
  <div class="outline">
    <div v-if="level === 0" class="level0" @click="handleClick(reportList)" @dblclick="handleDoubleClick(reportList)">
      <div v-if="!reportList.edit"> {{ reportList.title }}</div>
      <el-input v-else v-model="reportList.title" placeholder="请输入标题" @blur="handleSave(reportList)" />
    </div>
    <div v-else class="levelsBox" :style="getIndentStyle(level)">
      <div :class="reportList.children ? 'sex' : ''" v-if="!reportList.edit" @click="handleClick(reportList)"
        @dblclick="handleDoubleClick(reportList)">
        <div class="levels">{{ reportList.title }}</div>
        <div class="description">{{ reportList.description }}</div>
        <div v-if="reportList.children" class="newBox">
          <div class="Box" @click.stop="handleNewchildren(reportList)">
            <svg-icon name="Newchildren" width="16px" height="16px" />
            新增子集
          </div>
          <div class="Box" @click.stop="deleteCurrentSection(reportList)">
            <svg-icon name="deleteline" width="16px" height="16px" />
            删除当前集
          </div>
        </div>
      </div>
      <div v-else>
        <el-input v-model="reportList.title" placeholder="请输入标题" @blur="handleSave(reportList)" />
        <el-input v-model="reportList.description" placeholder="请输内容描述" @blur="handleSave(reportList)" />
      </div>
    </div>
    <div v-if="reportList.sections?.length > 0" :style="getIndentStyle(level)">
      <SectionItem :parentindex="parentindex" :parent="reportList" v-for="(subSection, index) in reportList.sections"
        :key="index" :level="level + 1" :reportList="subSection" :id="id" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuestionStore } from '@/stores/question'
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
const QuestionStore = useQuestionStore()
const clickTimeout = ref<any>(null);
const props = defineProps({
  reportList: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0
  },
  id: {
    type: Number,
    default: 0
  },
  parent: {
    type: Object,
    required: true,
  },
  parentindex: {
    type: Number,
    default: 0
  }
})
// 添加缩进样式计算函数
const getIndentStyle = (currentLevel: number) => {
  // level为0时不缩进，每增加一层缩进3ch
  return currentLevel > 1 ? { paddingLeft: `${10 * currentLevel}px` } : {};
};
function handleSave(item: any) {
  if (props.level === 0) {
    if (String(item.title.trim()).length === 0) {
      return ElMessage({
        message: '输入框不能为空',
        type: 'error',
      })
    } else {
      item.edit = false
    }
  } else {
    if (String(item.title.trim()).length > 0 && String(item.description.trim()).length > 0) {
      item.edit = false
    }
  }
}

function deleteCurrentSection(item: any) {
  props.parent.sections.splice(props.parent.sections.findIndex((obj: any) => obj === item), 1)
  handleSave(item)
}

function handleNewchildren(item: any) {
  if (!item.sections) {
    item.sections = []
  }
  item.sections.push({
    description: '',
    title: '',
    edit: true,
    sections: []
  })
}

const handleClick = (item: any) => {
  clearTimeout(clickTimeout.value);
  clickTimeout.value = setTimeout(() => {
    if (props.level !== 0 && 'edit' in item) {
      item.children = !item.children
    }
  }, 200); // 200ms内没有第二次点击则判定为单击
};

const handleDoubleClick = (item: any) => {
  clearTimeout(clickTimeout.value);
  if ('edit' in item) {
    item.edit = true;
  }

};
</script>

<style scope lang="scss">
.level0 {
  font-size: 16px;
  font-weight: bold;
  padding: 10px 0;
}

.levelsBox {
  padding: 5px 0;

  .sex {
    border: 1px solid #D5D8DE;
    border-radius: 6px;
    padding: 10px;
  }

  .newBox {
    display: flex;
    align-items: center;
    padding: 10px 0;

    .Box {
      display: flex;
      cursor: pointer;
      margin-right: 10px;
      align-items: center;
      font-size: 13px;
    }
  }
}

.levels {
  font-size: 15px;
  font-weight: bold;
}

.description {
  font-size: 13px;
}
</style>