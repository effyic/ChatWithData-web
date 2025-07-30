<template>
    <div class="create-instance">
      <div class="header">
        <div class="title">
          <!-- <el-icon><Connection /></el-icon> -->
          <h2>接入数据源</h2>
        </div>
        <div class="header-actions">
          <el-button class="qa-btn" link @click="router.push('/home/Question')">
            <el-icon><ChatDotRound /></el-icon>
            问答
          </el-button>
          <el-button class="create-btn" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            创建
          </el-button>
        </div>
      </div>
  
      <div class="instance-list">
        <div class="instance-card" v-for="(item,index) in instanceList" :key="index"  >
          <div class="instance-info" @click="showDatabaseDialog(item.id)">
            <div class="instance-name">
              <span >{{ item.name }}</span>
            </div>
            <div class="instance-detail">
              <div class="detail-item">
                <span class="label">主机</span>
                <span class="value">{{ formatUrl(item.url,'host') }}</span>
              </div>
              <div class="detail-item">
                <span class="label">端口</span>
                <span class="value">{{formatUrl(item.url,'port')}}</span>
              </div>
            </div>
          </div>
          <div class="instance-actions">
                <el-icon @click="editInstance(item)" size="16"><Edit /></el-icon>
                <el-icon @click="handleDelete(item.id)" color="#dc2626" size="16"><Delete /></el-icon>
            </div>
        </div>
      </div>
  
      <!-- 数据库选择弹窗 -->
      <el-dialog
        v-model="databaseDialogVisible"
        title="序列表"
        width="80%"
        :close-on-click-modal="false"
        destroy-on-close
        class="database-dialog"
      >
        <div class="database-content">
          <div class="table-list" v-loading="loading">
            <div class="table-header">数据库列表</div>
            <div class="table-items">
              <div 
                v-for="(db,index) in databaseList" 
                :key="index"
                class="database-item"
                :class="{ 'active': currentDatabase === db }"
              >
                  <div class="checkbox-wrapper" >
                    <el-checkbox-group v-model="selectedDatabases">
                      <el-checkbox 
                        :value="db"
                        @click.stop
                      >
                      </el-checkbox>
                    </el-checkbox-group>
                  </div>
                <div 
                  class="database-header"
                  @click="handleDatabaseClick(db)"
                >
                  <div class="db-name">
                    {{ db }}
                  </div>
                </div>
              </div>

                        <!-- 统一放一层 checkbox-group -->
            <!-- <el-checkbox-group v-model="selectedDatabases">
            <div 
                v-for="(db,index) in databaseList" 
                :key="index"
                class="database-item"
                :class="{ 'active': currentDatabase === db }"
            >
                <div class="checkbox-wrapper">
                <el-checkbox 
                    :value="db"
                    @click.stop
                    @change="(val) => handleCheckboxChange(val, db)"
                />
                </div>
                <div 
                class="database-header"
                @click="handleDatabaseClick(db)"
                >
                <div class="db-name">
                    {{ db }}
                </div>
                </div>
            </div>
            </el-checkbox-group> -->

            </div>
          </div>
          <div class="content-wrapper">
            <Transition name="slide">
              <div class="table-list" v-if="currentDatabase" v-loading="tableLoading">
                <div class="table-header">表列表</div>
                
                <div class="table-items">
                  <div 
                    v-for="table in tableList" 
                    :key="table"
                    class="table-item"
                    :class="{ 'active': currentTable === table }"
                    @click="selectTable(table)"
                  >
                    <!-- <el-icon><Grid /></el-icon> -->
                    <span>{{ table }}</span>
                    <div class="table-actions">
                        <el-tooltip
                      effect="dark"
                      content="添加表补充信息"
                      placement="top"
                    >
                    <el-button 
                      type="primary" 
                      link 
                      class="add-info-btn"
                      @click="showAddInfoDialog"
                    >
                      <el-icon><InfoFilled /></el-icon>
                    </el-button>
                    </el-tooltip>
                    
                  </div>
                  </div>
                </div>
              </div>
            </Transition>
            <Transition name="slide">
              <div class="field-content" v-if="currentTable">
                <div class="field-list">
                    <div class="field-list-header" style="margin-bottom: 10px;color:#064e3b;font-weight: 500;">表描述信息：-</div>
                  <el-table :data="fieldList" style="width: 100%" v-loading="fieldLoading">
                    <el-table-column prop="field_name" label="字段名" width="180" />
                    <el-table-column prop="data_type" label="类型" width="180" />
                    <el-table-column prop="field_comment" label="描述">
                      <template #default="{ row }">
                        <template v-if="row.isEditing">
                          <div class="description-input">
                            <el-input
                              v-model="row.field_comment"
                              placeholder="请输入字段描述"
                              @blur="handleSaveFieldDescription(row)"
                              @keyup.enter="handleSaveFieldDescription(row)"
                            />
                          </div>
                        </template>
                        <template v-else>
                          <div class="description-text" @click="row.isEditing = true">
                            {{ row.field_comment || '点击添加描述' }}
                          </div>
                        </template>
                      </template>
                    </el-table-column>
                  </el-table>
                  <!-- <div class="table-actions">
                    <el-button 
                      type="primary" 
                      link 
                      class="add-info-btn"
                      @click="showAddInfoDialog"
                    >
                      <el-icon><InfoFilled /></el-icon>
                      表补充信息
                    </el-button>
                  </div> -->
                </div>
              </div>
            </Transition>
          </div>
        </div>
        <!-- <template #footer>
          <div class="dialog-footer">
            <el-button plain @click="databaseDialogVisible = false">取消</el-button>
            <el-button type="primary" class="confirm-btn" @click="handleSaveDatabases">
              保存
            </el-button>
          </div>
        </template> -->
      </el-dialog>
  
      <!-- 创建连接弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'create' ? '创建' : '编辑'"
        width="480px"
        :close-on-click-modal="false"
        destroy-on-close
        class="create-dialog"
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="80px"
          inline
        >
          <el-form-item label="连接名" prop="name">
            <el-input 
              v-model="formData.name" 
              placeholder="请输入连接名称"
            />
          </el-form-item>
          <el-form-item label="主机" prop="host">
            <el-input 
              v-model="formData.host" 
              placeholder="请输入主机地址"
            />
          </el-form-item>
          <el-form-item label="端口" prop="port">
            <el-input 
              v-model="formData.port" 
              placeholder="请输入端口号"
            />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="formData.username" 
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="formData.password" 
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <div class="dialog-footer-left">
              <el-button info @click="testConnection">测试连接</el-button>
            </div>
            <div class="dialog-footer-right">
              <el-button plain @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" class="confirm-btn" @click="handleCreate">
                连接
              </el-button>
            </div>
          </div>
        </template>
      </el-dialog>
  
      <!-- 补充信息弹窗 -->
      <el-dialog
        v-model="addInfoDialogVisible"
        title="补充信息"
        width="500px"
        :close-on-click-modal="false"
        destroy-on-close
        class="add-info-dialog"
        append-to-body
      >
        <el-form :model="infoForm" label-position="top">
          <el-form-item label="表描述">
            <el-input
              v-model="infoForm.tableDescription"
              type="textarea"
              :rows="4"
              placeholder="请输入表的描述信息"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button plain @click="addInfoDialogVisible = false">取消</el-button>
            <el-button type="primary" class="confirm-btn" @click="handleSaveInfo">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive,onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Connection, ChatDotRound, Plus, Edit, Delete, Grid, InfoFilled, ArrowRight } from '@element-plus/icons-vue'
  import { useProjectStore } from '@/stores/project'
  import {useRouter} from "vue-router"
  import { watch } from 'vue'


  const projectStore = useProjectStore()
  const router = useRouter()
  // 弹窗显示状态
  const dialogVisible = ref(false)
  // 表单ref
  const formRef = ref()
  // 表单数据
  const formData = reactive({
    name: '',
    host: '',
    port: '',
    username: '',
    password: ''
  })
  
  const instanceList = ref([])  
  // 表单验证规则
  const rules = {
    name: [
      { required: true, message: '请输入连接名称', trigger: 'blur' },
    ],
    host: [
      { required: true, message: '请输入主机地址', trigger: 'blur' }
    ],
    port: [
      { required: true, message: '请输入端口号', trigger: 'blur' },
    ],
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ]
  }
  
  // 数据库选择弹窗状态
  const databaseDialogVisible = ref(false)
  const selectedDatabases = ref([])
  const databaseList = ref([])  
  const currentDatabase = ref(null)
  const currentTable = ref(null)
  const currentInstanceId = ref()
  const tableList = ref([])
  const fieldList = ref([])
  const fieldLoading = ref(false)

  // 监听选中状态变化
  watch(selectedDatabases, (newVal, oldVal) => {
    // 找出新增的数据库
    const added = newVal.find(db => !oldVal.includes(db))
    // 找出移除的数据库
    const removed = oldVal.find(db => !newVal.includes(db))
    
    if (removed) {
      // 取消选中
      handleSaveDatabases(undefined)
    } else if (added) {
      // 新选中
      handleSaveDatabases(added)
    }
  })

  // 补充信息弹窗状态
  const addInfoDialogVisible = ref(false)
  const infoForm = reactive({
    tableDescription: ''
  })
  const dialogType = ref('create')
  
  const loading = ref(false)
  const tableLoading = ref(false)

  // 显示创建弹窗
  const showCreateDialog = () => {
    dialogType.value = 'create'
    dialogVisible.value = true
    // 重置表单
    Object.keys(formData).forEach(key => {
      formData[key] = ''
    })
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  const getDatabaseList = async () => {
    loading.value = true
    try {
      const [databaseRes, usedRes] = await Promise.all([
        projectStore.database(currentInstanceId.value),
        projectStore.used(currentInstanceId.value)
      ])
      databaseList.value = databaseRes.data
      selectedDatabases.value = usedRes.data.map(item => item.name)
      
    } catch (error) {
      ElMessage.error('获取失败')
    } finally {
      loading.value = false
    }
  }

  // 显示数据库选择弹窗
  const showDatabaseDialog = (id) => {
    currentInstanceId.value = id
    tableList.value = []
    databaseDialogVisible.value = true
    getDatabaseList()
  }
 
  
  // 保存字段描述
  const handleSaveFieldDescription = (field) => {
    field.isEditing = false
    if (field.field_comment) {
        projectStore.edit(field.id,{    
            field_comment:field.field_comment
        }).then((res) => {
            ElMessage.success('保存成功')
            getFieldsList()
        })
    }
  }
  
  // 选择表
  const selectTable = (table) => {
    currentTable.value = table
    getFieldsList()
  }
  
  const getFieldsList = () => { 
    fieldLoading.value = true
    projectStore.fields(currentInstanceId.value,currentDatabase.value,currentTable.value).then((res) => {
        fieldList.value = res.data
        fieldLoading.value = false
    })
  }
  const handleCheckboxChange = (checked, db) => {
    console.log(checked,'是否选中')
    if (!checked) {
        handleSaveDatabases(undefined)
    } else{
        handleSaveDatabases(db)
    }
  }

  const handleDatabaseClick = (db) => {
      selectedDatabases.value.push(db)
      handleSaveDatabases(db)
  }
   // 保存选中的数据库
   const handleSaveDatabases = (db) => {
    projectStore.update(currentInstanceId.value,{
        name:Array.from(new Set(selectedDatabases.value))
    }).then((res) => {
        if(db){
            selectDatabase(db)
        }else{
            tableList.value = []
        }
    })
  }
  

  // 库查表
  const selectDatabase = (db) => {
    if (!db) return
    currentDatabase.value = db
    currentTable.value = null
    getTableList()
  }
  
  const getTableList = () => {
    if (!currentDatabase.value) return
    tableLoading.value = true
    projectStore.tables(currentInstanceId.value, currentDatabase.value).then((res) => {
        tableList.value = res.data
    }).finally(() => {
      tableLoading.value = false
    })
  }
 
  
  // 创建连接
  const handleCreate = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid, fields) => {
      if (valid) {
         const {host,port,username,password} = formData
        //  'dm://vanna:NewPass123!@192.168.0.160:5236'
         const url = `dm://${username}:${password}@${host}:${port}`
         switch(dialogType.value){  
          case 'create':
            projectStore.createDsn(projectStore.projectId,{
                name:formData.name,
                url
            }).then(() => {
                ElMessage.success('创建成功')
                dialogVisible.value = false
                getInstanceList()
            })
            break
            case 'edit':
              projectStore.editDsn(currentInstanceId.value,{
                name:formData.name,
                url
              }).then(() => {
                ElMessage.success('连接成功')
                dialogVisible.value = false
                getInstanceList()
            })
            break
         }
      }
    })
  }
  
  // 显示补充信息弹窗
  const showAddInfoDialog = () => {
    infoForm.tableDescription = currentTable.value.description || ''
    addInfoDialogVisible.value = true
  }
  
  // 保存补充信息
  const handleSaveInfo = () => {
    if (currentTable.value) {
      currentTable.value.description = infoForm.tableDescription
      ElMessage.success('保存成功')
      addInfoDialogVisible.value = false
    }
  }


  const testConnection = () => {
    const {host,port,username,password} = formData
    const url = `dm://${username}:${password}@${host}:${port}`
    projectStore.test(url).then((res) => {
      ElMessage.success('连接成功')
    })
  }

  const getInstanceList = () => {   
    projectStore.dnsLists(projectStore.projectId).then((res) => {
      instanceList.value = res.data
    })
  }

  const editInstance = (item) => {
    const {name,url} = item
    formData.name = name
    formData.host = formatUrl(url,'host')
    formData.port = formatUrl(url,'port')
    formData.username = formatUrl(url,'username')
    formData.password = formatUrl(url,'password')
    currentInstanceId.value = item.id
    dialogType.value = 'edit'
    dialogVisible.value = true
  }

  const handleDelete = (id) => {
    ElMessageBox.confirm('确认删除该实例吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
        projectStore.del(id).then((res) => {
            ElMessage.success('删除成功')
            getInstanceList()
        })
    })
}
  

  const formatUrl = (url,type) => {
    // dm://vanna:NewPass123!@192.168.0.160:5236
    const hostAndPort = url.split('@')[1] // 获取 192.168.0.160:5236
    if(type === 'host'){
        return hostAndPort.split(':')[0] // 返回 192.168.0.160
    }
    if(type === 'port'){
        return hostAndPort.split(':')[1] // 返回 5236
    }
    if(type === 'username'){
        return url.split('//')[1].split(':')[0] // 返回 vanna
    }
    if(type === 'password'){
        const temp = url.split('//')[1].split('@')[0] // 获取 vanna:NewPass123!
        return temp.split(':')[1] // 返回 NewPass123!
    }
  }

  onMounted(() => {
    getInstanceList()
  })
  </script>
  
  <style lang="scss" scoped>
  $primary-color: #064e3b;
  $btn-color: #007dff;

  .create-instance {
    // #eef3f0 #f6f8f7
    background-color: #FAFAFA;
    padding: 20px 120px;
    height: 100vh;
    // overflow-y: auto;
  //   background-color: #f6f8f7;
    // background-color: #fff;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 10px;
    // background: white;
    border-radius: 12px;
  //   box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #000000;
      font-size: 20px;
    //   color: #064e3b;
  
      .el-icon {
        font-size: 24px;
      }
  
      h2 {
        margin: 0;
        font-size: 25px;
        font-weight: 600;
      }
    }
  
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
  
      .qa-btn {
        font-size: 14px;
        color: $primary-color;
        .el-icon {
          font-size: 16px;
          margin-right: 4px;
        }
      }
  
      .create-btn {
        background-color: $primary-color;
        border-color: $primary-color;
        color: white;
        padding: 10px 20px;
        font-weight: 500;
        border-radius: 8px;
        transition: all 0.2s ease;
  
        .el-icon {
          margin-right: 4px;
        }
  
        &:hover {
          background-color: #047857;
          border-color: #047857;
          transform: translateY(-1px);
        }
  
        &:active {
          transform: translateY(0);
        }
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
      padding: 24px 0px;
      padding-bottom:10px;
    }
    .el-form-item{
        width:100%;
    }
  
    .el-form-item__label {
      padding-bottom: 8px;
      font-weight: 500;
      color: #292C2E;
    }
  
    .el-input__wrapper {
        width: 100%;
      padding: 4px 12px;
      border-radius: 8px;
      box-shadow: 0 0 0 1px #e2e8f0 inset;
      transition: all 0.2s ease;
  
      &:hover {
        box-shadow: 0 0 0 1px $primary-color inset;
      }
  
    }
  
    .dialog-footer {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding:0px 24px;
      padding-top: 0px;
      padding-bottom: 20px;
  
      .confirm-btn {
        background-color: $primary-color;
        border-color: $primary-color;
        color: white;
        font-weight: 500;
        padding: 10px 24px;
  
        &:hover {
          background-color: #047857;
          border-color: #047857;
        }
      }
  
      .el-button {
        border-radius: 8px;
      }
    }
  }
  
  :deep(.database-dialog) {
    .el-dialog__header {
      margin: 0;
      padding: 10px 10px 20px 0px;
      border-bottom: 1px solid #e2e8f0;
  
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: $primary-color;
      }
    }
  
    .el-dialog__body {
      padding: 0;
    }
  
    .database-content {
      display: flex;
      height: 450px;
  
      .table-list {
        width: 240px;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #e2e8f0;
        background-color: #f6f8f7;
  
        .table-header {
          padding: 16px;
          font-size: 14px;
          font-weight: 500;
          color: $primary-color;
          border-bottom: 1px solid #e2e8f0;
        }
  
        .table-items {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
  
          .database-item {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            .el-checkbox {
                width: 100%;
  
  
                .el-checkbox__input {
                  .el-checkbox__inner {
                    border-color: #e2e8f0;
  
                    &:hover {
                      border-color: $primary-color;
                    }
                  }
  
                  &.is-checked .el-checkbox__inner {
                    background-color: $primary-color;
                    border-color: $primary-color;
                  }
  
                  &.is-checked + .el-checkbox__label {
                    color: $primary-color;
                  }
                }
              }
            .database-header {
              width: 100%;
              display: flex;
              align-items: center;
              padding: 12px 12px;
              border-radius: 4px;
              transition: all 0.2s;
              cursor: pointer;
  
              &:hover {
                background-color: #eef3f0;
              }
              .db-name{
                  font-weight: 500;
                  color: $primary-color;
              }
  
              .checkbox-wrapper {
                // flex: 1;
              }
  
              
              .expand-wrapper {
                  width: 25px;
                  display: flex;
                  justify-content: center;
                  .expand-icon {
                      font-size: 13px;
                      color: #84a89c;
                      transition: transform 0.2s;
  
                      &:hover {
                          color: $primary-color;
                      }
  
                      &.is-active {
                          transform: rotate(90deg);
                          color: $primary-color;
                      }
                      }
              }
            }
  
            &.active {
              .database-header {
                background-color: #eef3f0;
              }
            }
          }
  
          .table-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 10px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            color: #1e293b;
            margin-bottom: 8px;

            .table-actions {
              opacity: 0;
              transform: translateX(10px);
              transition: all 0.3s ease;
            }

            &:hover {
              background-color: #eef3f0;
              .table-actions {
                opacity: 1;
                transform: translateX(0);
              }
            }
  
            .el-icon {
              font-size: 16px;
              color: $primary-color;
            }
  
            &.active {
              color: $primary-color;
              background-color: #eef3f0;
              font-weight: 500;
            }
          }
        }
      }
  
      .content-wrapper {
        flex: 1;
        display: flex;
        background-color: white;
  
        .table-list {
          width: 240px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #e2e8f0;
          background-color: white;
        }
  
        .field-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: white;
  
          .field-list {
            flex: 1;
            padding: 16px;
            height: 100%;
            overflow: auto;
  
            :deep(.el-table) {
              th {
                background-color: #f6f8f7;
                color: $primary-color;
                font-weight: 500;
              }
  
              td {
                color: #1e293b;
              }
  
              tr:hover > td {
                background-color: #f6f8f7;
              }
  
              .description-text {
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                color: #1e293b;
  
                &:empty::before {
                  content: '点击添加描述';
                  color: #94a3b8;
                }
  
                &:hover {
                  background-color: #eef3f0;
                }
              }
  
              .description-input {
                .el-input__wrapper {
                  box-shadow: 0 0 0 1px #e2e8f0 inset;
  
                  &:hover {
                    box-shadow: 0 0 0 1px $primary-color inset;
                  }
                }
              }
            }
          }
  
          .table-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
  
            .add-info-btn {
              color: $primary-color;
              font-size: 14px;
              
              .el-icon {
                margin-right: 4px;
              }
  
              &:hover {
                color: #047857;
              }
            }
          }
  
          .empty-tip {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-size: 14px;
          }
        }
      }
    }
  
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
  
      .confirm-btn {
        background-color: $primary-color;
        border-color: $primary-color;
        color: white;
        font-weight: 500;
        padding: 10px 24px;
  
        &:hover {
          background-color: #047857;
          border-color: #047857;
        }
      }
  
      .el-button {
        border-radius: 8px;
      }
    }
  }
  
  .instance-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    padding: 10px 0px;
    box-sizing: border-box;
  
    .instance-card {
      // fcfdfc
      background: #fafbfa;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #fafbfa;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      height: fit-content;
      cursor: pointer;
      .instance-actions{
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
        }
      .instance-info {
        .instance-name {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: $primary-color;
          font-size: 16px;
          font-weight: 500;

          span {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
  
          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: $primary-color;
            flex-shrink: 0;
          }
        }
        .instance-detail {
          display: flex;
          flex-direction: column;
          gap: 8px;
  
          .detail-item {
            display: flex;
            align-items: center;
            gap: 12px;
  
            .label {
              color: #64748b;
              font-size: 14px;
              width: 60px;
              flex-shrink: 0;
            }
  
            .value {
              color: #1e293b;
              font-size: 14px;
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
  
  .db-detail-dialog {
    .el-dialog__header {
      margin: 0;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
  
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: $primary-color;
      }
    }
  
    .el-dialog__body {
      padding: 0;
    }
  
    .database-content {
      display: flex;
      height: 450px;
      overflow: auto;
      // height: 600px;
  
      .table-list {
        width: 240px;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #e2e8f0;
        background-color: #f6f8f7;
  
        .table-header {
          padding: 16px;
          font-size: 14px;
          font-weight: 500;
          color: $primary-color;
          border-bottom: 1px solid #e2e8f0;
        }
  
        .table-items {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          height: 100%;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
  
          .table-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            color: #1e293b;
  
            .el-icon {
              font-size: 16px;
              color: $primary-color;
            }
  
            &:hover {
              background-color: #eef3f0;
            }
  
            &.active {
              color: $primary-color;
              background-color: rgba($primary-color, 0.1);
              border: 1px solid $primary-color;
              font-weight: 500;
            }
          }
        }
      }
  
      .field-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        background-color: white;
  
        .field-list {
          flex: 1;
          padding: 16px;
  
          :deep(.el-table) {
            th {
              background-color: #f6f8f7;
              color: $primary-color;
              font-weight: 500;
            }
  
            td {
              color: #1e293b;
            }
  
            tr:hover > td {
              background-color: #f6f8f7;
            }
  
            .description-text {
              cursor: pointer;
              padding: 4px 8px;
              border-radius: 4px;
              color: #1e293b;
  
              &:empty::before {
                content: '点击添加描述';
                color: #94a3b8;
              }
  
              &:hover {
                background-color: #eef3f0;
              }
            }
  
            .description-input {
              .el-input__wrapper {
                box-shadow: 0 0 0 1px #e2e8f0 inset;
  
                &:hover {
                  box-shadow: 0 0 0 1px $primary-color inset;
                }
              }
            }
          }
        }
  
        .empty-tip {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 14px;
        }
  
        .table-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
  
          .add-info-btn {
            color: $primary-color;
            font-size: 14px;
            
            .el-icon {
              margin-right: 4px;
            }
  
            &:hover {
              color: #047857;
            }
          }
        }
      }
    }
  }
  
  .add-info-dialog {
    .el-dialog__header {
      margin: 0;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      background-color: #f6f8f7;
  
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: $primary-color;
      }
    }
  
    .el-dialog__body {
      padding: 24px;
      background-color: white;
    }
  
    .el-form-item__label {
      padding-bottom: 8px;
      font-weight: 500;
      color: $primary-color;
    }
  
    .el-input__wrapper {
      &:hover {
        box-shadow: 0 0 0 1px $primary-color inset;
      }
  
      &.is-focus {
        box-shadow: 0 0 0 2px $primary-color inset !important;
      }
    }
  
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      margin-top: 16px;
  
      .confirm-btn {
        background-color: $primary-color;
        border-color: $primary-color;
        color: white;
        font-weight: 500;
        padding: 10px 24px;
  
        &:hover {
          background-color: #047857;
          border-color: #047857;
        }
      }
  
      .el-button {
        border-radius: 8px;
      }
    }
  }
  
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }
  
  .slide-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
  </style>
  