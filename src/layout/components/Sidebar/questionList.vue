<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/question'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import cache from "@/utils/cache";
const QuestionStore = useQuestionStore()
const route = useRoute()
const router = useRouter()

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
})
onMounted(() => {

  // if (cache.local.get("token")) {
  QuestionStore.sessionsList() //会话列表
  // }
})

function handleOpenHistory(item: any) {
  if (route.name !== 'Question') {
    router.push({ name: 'Question' });
  }

  QuestionStore.getHistory(item.id)
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm(
    '删除后聊天记录可不恢复，是否确认删除?',
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      QuestionStore.deleteHistory(id).then(res => {
        ElMessage({
          type: 'success',
          message: '删除成功',
        })
      })
    })
}

const sessionItem = ref<any>()

const handleUpdate = (item: any) => {
  sessionItem.value = item
  form.name = item.name
  dialogVisible.value = true
}
const updateSessionFn = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      QuestionStore.updateSessionFn(sessionItem.value.id, form.name).then(res => {
        ElMessage.success('更新成功')
        handleClose()
      })
    }
  })
}

const dialogVisible = ref(false)
const ruleFormRef = ref<FormInstance>()

const handleClose = () => {
  form.name = ''
  dialogVisible.value = false
}

const form = reactive({
  name: '',
})

</script>

<template>
  <div v-show="!collapse" style="height: 100%;">

    <div class="addBtn" @click="router.push({ name: 'Question' }); QuestionStore.NewSession()">
      新建会话
      <img src="@/assets/images/addChat.png" alt="">
    </div>
    <div style="height: calc(100% - 56px);overflow-y: auto;">
      <div class="quseTop">最近对话</div>
        <div class="qusetionItem" :class="{ 'active': item.id === QuestionStore.idIndex }"
          v-for="(item, i) in QuestionStore.sessionsItemList" :key="i" @click="handleOpenHistory(item)">
          <div class="Item">{{ item.name }}</div>
          <el-icon style="margin-right: 8px;" @click.stop="handleUpdate(item)" class="action-icon">
            <Edit />
          </el-icon>
          <el-icon @click.stop="handleDelete(item.id)" class="action-icon">
            <Delete />
          </el-icon>
        </div>
    </div>




    <el-dialog v-model="dialogVisible" title="编辑会话" width="500" :before-close="handleClose">
      <el-form ref="ruleFormRef" :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="会话名称" prop="name" :rules="[{ required: true, message: '请输入会话名称', trigger: 'blur' }]">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="updateSessionFn(ruleFormRef)">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.addBtn {
  cursor: pointer;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3962A5;
  border-radius: 10px;
  font-size: 16px;
  color: #fff;
  margin-bottom: 16px;

  &:hover {
    background-color: #6A89BB;
  }

  img {
    width: 16px;
    margin-left: 8px;
  }
}

.quseTop {
  font-size: 12px;
  color: #858D94;

}

.qusetionItem {
  margin-top: 10px;
  cursor: pointer;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #575C61;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .Item {
    width: 86%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.qusetionItem.active {
  background: #E6E8EB;
  border-radius: 10px;
}

.qusetionItem:hover {
  background: #E6E8EB;
  border-radius: 10px;
}
</style>
