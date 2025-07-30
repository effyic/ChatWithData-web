<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { Edit, Monitor, Loading, More, Plus } from '@element-plus/icons-vue'
import FeedbackService from '@/api/feedback'

const dialogVisible = ref(false)
const activeTab = ref('3')
const fileList = ref<UploadUserFile[]>([])
const feedbackForm = ref()
const formData = reactive({
  content: '',
  images: [] as number[]
})

const rules = {
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' },
    { max: 500, message: '内容不能超过 500 个字符', trigger: 'blur' }
  ]
}

const headers = computed(() => ({
  Authorization: `Bearer ${window.localStorage.getItem('token')}`
}))

const tabs = [
  { label: '问答效果', value: '3' },
  { label: '功能问题', value: '1' },
  { label: '产品建议', value: '2' },
  { label: '账号问题', value: '4' }
]

// 打开弹窗
const open = () => {
  dialogVisible.value = true
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  formData.content = ''
  fileList.value = []
  feedbackForm.value.resetFields()
}

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {

  // 检查文件大小（3M = 3 * 1024 * 1024 bytes）
  const isLt3M = file.size / 1024 / 1024 < 3
  if (!isLt3M) {
    ElMessage.error('图片大小不能超过 3MB！')
    return false
  }

  return true
}
function formatArrayToObjects(arr: number[]): { id: number }[] {
  return arr.map(item => ({ id: item }))
}
// 提交反馈
const submitFeedback = async () => {
    feedbackForm.value.validate((valid:any) => {
      if (valid) {
        FeedbackService.feedbacks({
          feedback_type: Number(activeTab.value),
          content: formData.content,
          files: formatArrayToObjects(formData.images)
  }).then((res:any) => {
      ElMessage.success('提交成功')
      handleClose()
    })
    }
  })
}

// 添加上传回调函数
const onSuccess = (response: any, file: any) => {
  formData.images.push(Number(response.data?.id))
}

const onError = () => {
  ElMessage.error('上传失败')
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    width="500px"
    :before-close="handleClose"
    style="border-radius: 20px;"
  >
    <template #header>
      <div class="dialog-title">
        <span class="main-title">意见反馈</span>
        <!-- <span class="sub-title">（感谢您反馈的宝贵意见，若被我们采纳您将可能收到我们的小礼品）</span> -->
         <span class="sub-title">（您的建议被我们采纳后会有相应小礼品赠送）</span>
      </div>
    </template>
    <div class="feedback-container">
      <div class="left-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="['custom-tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </div>
      </div>

      
      <div class="right-form">
        <el-form
          ref="feedbackForm"
          :model="formData"
          :rules="rules"
          label-position="top"
        >
        <!--  label="反馈内容" -->
          <el-form-item
           
            prop="content"
          >
            <el-input
              v-model="formData.content"
              type="textarea"
              :rows="6"
              :maxlength="500"
              show-word-limit
              placeholder="请输入您的意见或者建议"
            />
          </el-form-item>
          <!-- label="上传图片"  -->
          <el-form-item prop="images">
            <el-upload
              v-model:file-list="fileList"
              action="/api/upload"
              list-type="picture-card"
              :limit="4"
              :before-upload="beforeUpload"
              :on-success="onSuccess"
              :on-error="onError"
              multiple
              :headers="headers"
              accept="image/jpeg,image/jpg,image/png"
            >
              <el-icon><Plus /></el-icon>
              <template #tip>
                <div class="upload-tip">
                  支持 jpg、jpeg、png 格式，单张不超过 3M，最多 4 张
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitFeedback">
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-title {
  padding: 20px 20px 0;
  
  .main-title {
    font-size: 18px;
    font-weight: 500;
    color: #000000;
  }
  
  .sub-title {
    font-size: 14px;
    color: #909399;
    margin-left: 3px;
  }
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 0;
}
:deep(.el-button){
    border-radius: 6px;
}
:deep(.el-button--primary){
   background-color: #007DFA;
   border-color: #007DFA;
}

.feedback-container {

  .left-tabs {
    :deep(.el-tabs__item) {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      
      .el-icon {
        margin-right: 8px;
      }
    }
  }

  .right-form {
    flex: 1;
    padding: 0 16px;

    .upload-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 8px;
    }
    :deep(.el-textarea) {
     border-color: #CED0D6;
     .el-textarea__inner {
        border-radius: 10px;
     }
    }
    :deep(.el-upload){
        width: 80px;
        height: 80px;
    }
    :deep(.el-upload-list__item-status-label) {
      display: none;
    }
    :deep(.el-upload-list__item) {
     width: 80px;
     height: 80px;
    }
    :deep(.el-upload--picture-card) {
      border-color: #CED0D6;
      border-radius: 10px;
      background-color: #fff;
    }
  }
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

.left-tabs {
  display: flex;
  gap: 16px;
  padding: 16px;

  .custom-tab {
    width: 88px;
    height: 32px;
    background-color: #EBEBEB;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    color: #333;

    &:hover {
      background-color: #CCE5FE;
      border: 1px solid #007DFA;
      color: #007DFA;

    }

    &.active {
      background-color: #CCE5FE;
      border: 1px solid #007DFA;
      color: #007DFA;
    }
  }
}
</style>
