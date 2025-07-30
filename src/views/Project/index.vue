<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Folder, Plus, Document, Connection, ChatDotRound } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router'
  import { useProjectStore } from '@/stores/project'
  import { useQuestionStore } from '@/stores/question'
  
  const router = useRouter()
  const projectStore = useProjectStore()
  const QuestionStore = useQuestionStore()
  // 弹窗显示状态
  const dialogVisible = ref(false)
  // 表单ref
  const formRef = ref()
  // 表单数据
  const formData = reactive({
    name: '',
    describe: ''
  })
  const projectList = ref([])
  // 表单验证规则
  const rules = {
    name: [
      { required: true, message: '请输入系统名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    describe: [
      { required: false, message: '请输入系统描述', trigger: 'blur' },
      { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
    ]
  }
  
  
  const handleCreateInstance = (id) => {
    projectStore.setProjectId(id)
    router.push('/instance')
  }
  // 显示创建弹窗
  const showCreateDialog = () => {
    dialogType.value = 'create'
    dialogVisible.value = true
    // 重置表单
    formData.name = ''
    formData.describe = ''
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  // 编辑系统
  const handleEdit = (id) => {
    dialogType.value = 'edit'
    // 获取当前系统信息
    const currentProject = projectList.value.find(item => item.id === id)
    if (currentProject) {
      formData.name = currentProject.name
      formData.describe = currentProject.describe
      currentProjectId.value = id
      dialogVisible.value = true
    }
  }
  
  // 创建/编辑系统
  const handleCreate = async () => {
    if (!formRef.value) return
    
    await formRef.value.validate((valid, fields) => {
      if (valid) {
        if (dialogType.value === 'create') {
          // 创建系统
          projectStore.create(formData).then(() => {   
            ElMessage.success('创建成功')
            getProjectList()
            dialogVisible.value = false
          })
        } else {
          // 编辑系统
          projectStore.editProject(currentProjectId.value, formData).then(() => {
            ElMessage.success('编辑成功')
            getProjectList()
            dialogVisible.value = false
          })
        }
      }
    })
  }

  // 添加 currentProjectId ref
  const currentProjectId = ref()

  // 修改弹窗标题
  const dialogType = ref('create')

  const getProjectList = () => {
    console.log('getProjectList')
    projectStore.list().then((res) => {
      projectList.value = res.data
    })
  }

  onMounted(() => {
    getProjectList()
  })

  const handleDelete = (id) => {
    ElMessageBox.confirm('确认删除该系统吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      projectStore.deleteProject(id).then(() => {
        ElMessage.success('删除成功')
        getProjectList()
      }).catch(() => {
        ElMessage.error('删除失败')
      })
    })
  }

  const toQuestion = (id) => {
    QuestionStore.NewSession()
    router.push({
        path:'/home/Question',
        query:{
            projectId:id
        }
    })
  }
</script>



  <template>
    <div class="project-view">
    <div class="search">
      <p>系统管理</p>
      <el-button type="primary"  @click="showCreateDialog">
        创建系统</el-button>
    </div>
  
      <div class="project-list">
        <div class="project-card" v-for="(item,index) in projectList" :key="index">
          <div class="card-header" >
           <div @click="handleCreateInstance(item.id)">
                <div class="project-title">
                <span>{{item.name}}</span>
                </div>
                <div class="project-description">
                <el-tooltip
                    :content="item.describe"
                    placement="top"
                    :show-after="200"
                    effect="dark"
                >
                    <span>{{item.describe}}</span>
                </el-tooltip>
                </div>
           </div>
            <div class="project-actions">
              <!-- <el-tooltip effect="dark" content="接入数据源" placement="top">
                <el-button link type="primary" @click="handleCreateInstance(item.id)"> 
                  <el-icon color="#1e293b"><Connection /></el-icon>
                </el-button>
              </el-tooltip> -->
              <el-tooltip effect="dark" content="问答" placement="top">
                <el-button link type="danger" @click="toQuestion(item.id)">
                  <el-icon color="#1e293b"><ChatDotRound /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="编辑" placement="top">
                <el-button link type="primary" @click="handleEdit(item.id)">
                  <el-icon color="#1e293b"><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="删除" placement="top">
                <el-button link type="danger" @click.stop="handleDelete(item.id)">
                  <el-icon color="#dc2626"><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              
            </div>
          </div>
        </div>
      </div>
  
      <!-- 创建系统弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'create' ? '创建系统' : '编辑系统'"
        width="480px"
        :close-on-click-modal="false"
        destroy-on-close
        class="create-dialog"
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          :inline="false"
          label-width="80px"
        >
          <el-form-item label="系统名称" prop="name">
            <el-input 
              v-model="formData.name" 
              placeholder="请输入系统名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="系统描述" prop="describe">
            <el-input 
              v-model="formData.describe" 
              type="textarea"
              placeholder="请输入系统描述"
              maxlength="200"
              show-word-limit
              :rows="4"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button plain @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleCreate">
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>



  <style lang="scss" scoped>
  $primary-color: #3962A5;
  .project-view {
    padding: 24px;
    height: 100vh;
    padding: 20px 120px;
    .search {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    p {
      color: #000000;
      font-size: 30px;
      font-weight: 600;
    }

    :deep(.el-button) {
      width: 96px;
    //   height: 40px;
      border-radius: 8px;
      background-color: $primary-color;
      color: #ffffff;
      border: none;
      font-size: 14px;
    }

  }
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #047857;
  
      .el-icon {
        font-size: 24px;
      }
  
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
    }
  
    .create-btn {
      background-color: #10b981;
      border-color: #10b981;
      color: white;
      padding: 10px 20px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s ease;
  
      .el-icon {
        margin-right: 4px;
      }
  
      &:hover {
        background-color: #059669;
        border-color: #059669;
        transform: translateY(-1px);
      }
  
      &:active {
        transform: translateY(0);
      }
    }
  }
  
  :deep(.create-dialog) {
    padding:24px;
    border-radius: 18px;
    .el-dialog__header {
      margin: 0;
      padding: 8px 0px;
  
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #292C2E;
      }
    }
  
    .el-dialog__body {
      padding: 24px 0px 0px 0px;
    }

    .el-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .el-form-item {
        margin-right: 0;
        width: 100%;
      }
    }
  
    .el-form-item__label {
      padding-bottom: 8px;
      color: #292C2E;
    }
  
    .el-input__wrapper {
      padding: 4px 12px;
    //   border-radius: 8px;
      box-shadow: 0 0 0 1px #e2e8f0 inset;
      transition: all 0.2s ease;
  
      &:hover {
        box-shadow: 0 0 0 1px #007DFA inset;
      }
    }
    .el-textarea__inner{
        box-shadow: 0 0 0 1px #e2e8f0 inset;
    }
  
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 8px;
      .el-button--primary {
          background-color: $primary-color;
          border-color: $primary-color;
          &:hover {
            background-color: $primary-color;
            border-color: $primary-color;
          }
        }

      .el-button {
        border-radius: 8px;
        
    
      }
    }
  }
  
  .project-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }
  
  .project-card {
    background: #F7F9FB;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    overflow: hidden;
  
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .card-header {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      height: 100%;
      cursor: pointer;

      .project-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #073B8E;
        font-weight: 500;
        font-size: 16px;
        width: 100%;
        word-break: break-all;
        margin-bottom: 15px;
  
        .el-icon {
          font-size: 18px;
          color: #047857;
          flex-shrink: 0;
        }
      }
  
      .project-description {
        color: #64748b;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 15px;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
  
      .project-actions {
        margin-top: auto;
        display: flex;
        justify-content: flex-end;
        width: 100%;
  
        .el-button {
        //   padding: 4px 8px;
          font-size: 14px;
          margin-left:0px;
  
          .el-icon {
            font-size: 16px;
            margin-right: 4px;
          }
        }
      }
    }
  
    .card-content {
      padding: 16px 20px;
      background: #fafafa;
  
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;
  
        &:last-child {
          margin-bottom: 0;
        }
  
        .label {
          color: #64748b;
          width: 84px;
        }
  
        .value {
          color: #1e293b;
        }
      }
    }
  }
  </style> 