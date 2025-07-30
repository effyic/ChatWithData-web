<template>
  <div class="outline">
    <div class="levelsBox">
      <div v-if="level === '1'">
        <div class="levels">{{ reportList.title }}</div>
        <div class="description">{{ reportList.description }}</div>
      </div>
      <div v-else class="Boxindect">
        <div class="levels">{{ reportList.title }}</div>
        <div class="description">{{ reportList.description }}</div>
      </div>
    </div>
    <div v-if="reportList.sections?.length > 0">
      <drawerItem v-for="(subSection, index) in reportList.sections" :key="index" :reportList="subSection"
        :level="level + 1" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps({
  reportList: {
    type: Object,
    required: true,
  },
  level: {
    type: String,
    default: '1'
  },

})
</script>

<style scope lang="scss">
.levelsBox {
  padding: 5px 0;

  .Boxindect {
    text-indent: 3ch;
  }
}

.levels {
  font-size: 15px;
  font-weight: 500;
  color: #292C2E;
}

.description {
  font-size: 13px;
}
</style>