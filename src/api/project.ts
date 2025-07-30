import service from '@/utils/request'

class KnowledgeService {
  //   创建项目
  createProject(data: any) {
    return service.post('projects', data)
  }
  // 删除项目
  deleteProject(id: number) {
    return service.delete(`projects/${id}`)
  }
  // 编辑项目
  editProject(id:number,data:any){
    return service.put(`projects/${id}`,data)
  }
  // 项目列表 
  projectList() {
    return service.get('projects')
  }
  // 测试dsn连接
  dnsTest(data: any) {
    return service.post('dsn/test', data)
  }
  // 新建项目dsn实例
    createDsnInstance(id: number, data:any) {
      return service.post(`projects/${id}/dsn`, data)
    }
  // 编辑dsn连接信息
  updateDsnInstance(id: number, data:any) {
    return service.put(`dsn/${id}`, data)
  }
  //   dsn实例列表
  dnsList(id: number) {
    return service.get(`projects/${id}/dsn`)
  }
  // 删除dns
  deleteDsn(id: number) {
    return service.delete(`dsn/${id}`)
  }
  //   dsn下的数据库列表
  databaseList(id: number) {
    return service.get(`dsn/${id}/databases`)
  }
  //   修改使用中的数据库 checkbox
  updateUsedDatabase(id: number, data:any) {
    return service.post(`dsn/${id}/used_databases`,data)
  }
  // 使用中的数据库列表 回显
  usedDataBases(id: number) {
    return service.get(`dsn/${id}/used_databases`)
  }
  // 数据库下表列表
  databaseTables(id: number,name:string) {
    return service.get(`dsn/${id}/databases/${name}/tables`)
  }
  // 表字段列表
  tablesFields(id: number,name:string,table_name:string) {
    return service.get(`dsn/${id}/databases/${name}/tables/${table_name}/fields`)
  }
  // 编辑字段备注信息
  editField(id: number,data:any) {
    return service.put(`dsn/field/${id}`,data)
  }
  // 表备注
  updateComment(id: number,data:any) {
    return service.put(`table/${id}/comment`,data)
  }
  
}

export default new KnowledgeService()
