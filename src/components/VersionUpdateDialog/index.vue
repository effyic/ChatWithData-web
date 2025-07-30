<template>
    <el-dialog
      v-model="updateStore.updateDialog"
      title="版本更新通知"
      width="600px"
      @close="operationReadVersion"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="update-container">
        <div class="update-content">
          <h3>v{{ updateStore.updateInfo?.version_number }}版本更新内容</h3>
          <div v-for="(item, index) in content" :key="index">
            <!-- 文本内容 -->
            <div v-if="item.type === 'text'" class="content-text">
              {{ item.content }}
            </div>
            <!-- 图片内容 -->
            <div v-else-if="item.type === 'image'" class="content-image">
              <el-image 
                :src="item.content" 
                fit="contain"
                style="width: 60%; max-height: 200px;"
              />
            </div>
          </div>
        </div>
       
      </div>
      <div class="update-footer">
          <span class="update-date">{{ dayjs(updateStore.updateInfo?.created_at).format('YYYY-MM-DD') }}</span>
        </div>
    </el-dialog>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useUpdateStore } from '@/stores/update'
  import FeedbackService from '@/api/feedback'
  import dayjs from 'dayjs'

  const updateStore = useUpdateStore()

  interface ContentItem {
    type: 'text' | 'image'
    content: string
  }

  const content = computed<ContentItem[]>(() => {
    try {
      return JSON.parse(updateStore.updateInfo?.content || '[]')
    } catch (e) {
      return []
    }
  })

  function operationReadVersion() {
    FeedbackService.readVersion({version_id:updateStore.updateInfo?.id})
  }
  </script>
  
  <style lang="scss" scoped>
  .update-container {
    height: 500px;
    overflow-y: auto;
    padding: 20px;
    padding-top: 10px;
  
    .update-content {
      h3 {
        margin: 0 0 16px;
        font-size: 18px;
        color: #303133;
      }
  
      .content-text {
          margin-bottom: 16px;
          font-size: 15px;
          color: #333;
          line-height: 1.6;
        }
  
        .content-image {
          margin: 16px;
          // text-align: center;
        }
    }
  }
  .update-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      
      .update-date {
        font-size: 12px;
        color: #909399;
      }
    }
  </style> 