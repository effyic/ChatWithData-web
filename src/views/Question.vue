<template>
  <div class="upload-container">
    <el-upload
      class="upload-file"
      :auto-upload="true"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
    >
      <div class="upload-trigger" v-if="!fileInfo">
        <el-icon class="upload-icon"><Upload /></el-icon>
        <div class="upload-text">点击上传文件</div>
      </div>
      <div v-else class="file-info">
        <el-icon class="file-icon"><Document /></el-icon>
        <span class="file-name">{{ fileInfo.name }}</span>
        <el-icon class="delete-icon" @click.stop="handleDelete"><Delete /></el-icon>
      </div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Document, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const fileInfo = ref<{ name: string } | null>(null)

const handleSuccess = (response: any, uploadFile: any) => {
  fileInfo.value = {
    name: uploadFile.name
  }
  ElMessage.success('上传成功')
}

const handleError = () => {
  ElMessage.error('上传失败')
}

const handleDelete = () => {
  fileInfo.value = null
}
</script>

<style lang="scss" scoped>
.upload-container {
  width: 100%;
  
  .upload-file {
    width: 100%;
    
    :deep(.el-upload) {
      width: 100%;
    }
  }
  
  .upload-trigger {
    width: 100%;
    height: 120px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s;
    
    &:hover {
      border-color: #409EFF;
    }
    
    .upload-icon {
      font-size: 28px;
      color: #8c939d;
      margin-bottom: 8px;
    }
    
    .upload-text {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .file-info {
    width: 100%;
    height: 56px;
    background: #f5f7fa;
    border-radius: 8px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    position: relative;
    
    .file-icon {
      font-size: 20px;
      color: #909399;
      margin-right: 8px;
    }
    
    .file-name {
      flex: 1;
      font-size: 14px;
      color: #606266;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .delete-icon {
      font-size: 16px;
      color: #909399;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.3s;
      
      &:hover {
        color: #f56c6c;
        background: rgba(245, 108, 108, 0.1);
      }
    }
  }
}
</style> 