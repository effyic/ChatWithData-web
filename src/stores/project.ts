import { defineStore } from 'pinia'
import ProjectService from '@/api/project'
import { ref } from 'vue'

export const useProjectStore = defineStore('knowledge', () => {
  
  const projectId = ref(localStorage.getItem('projectId') || '')

  const setProjectId = (id: string | number) => {
    projectId.value = String(id)
    localStorage.setItem('projectId', String(id))
  }

  function create(data:any) {
    return ProjectService.createProject(data).then((res) => {
      return Promise.resolve(res)
    })
  }

  function deleteProject(id: number) {
    return ProjectService.deleteProject(id).then((res) => {
      return Promise.resolve(res)
    })
  }

  function editProject(id: number,data:any) {
    return ProjectService.editProject(id,data).then((res) => {
      return Promise.resolve(res)
    })
  }

  function list() {
    return ProjectService.projectList().then((res) => {
      return Promise.resolve(res)
    })
  }

  function test(url: string,dsn_type: string) {
    return ProjectService.dnsTest({url,dsn_type}).then((res) => {
      return Promise.resolve(res)
    })
  }

  function createDsn(id: number,data:any) {
    return ProjectService.createDsnInstance(id,data).then((res) => {
      return Promise.resolve(res)
    })
  }

  function editDsn(id: number,data:any) {
    return ProjectService.updateDsnInstance(id,data).then((res) => {
      return Promise.resolve(res)
    })
  }

  function del(id: number) {
    return ProjectService.deleteDsn(id).then((res) => {
      return Promise.resolve(res)
    })
  }

  function dnsLists(id: number) {
    return ProjectService.dnsList(id).then((res) => {
      return Promise.resolve(res)
    })
  }


  function database(id: number) {
    return ProjectService.databaseList(id).then((res) => {
      return Promise.resolve(res)
    })
  }


  function update(id: number,data:any) {
    return ProjectService.updateUsedDatabase(id,data).then((res) => {
      return Promise.resolve(res)
    })
  }

  function used(id: number) {
    return ProjectService.usedDataBases(id).then((res) => {
      return Promise.resolve(res)
    })
  }


  function tables(id: number,name:string) {
    return ProjectService.databaseTables(id,name).then((res) => {
      return Promise.resolve(res)
    })
  }



  function fields(id: number,name:string,tableName:string) {
    return ProjectService.tablesFields(id,name,tableName).then((res) => {
      return Promise.resolve(res)
    })
  }

  function edit(id: number,data:any) {
    return ProjectService.editField(id,data).then((res) => {  
      return Promise.resolve(res)
    })
  }

  function updateComment(id: number,data:any) {
    return ProjectService.updateComment(id,data).then((res) => {
      return Promise.resolve(res)
    })
  }

  return {
    create,
    list,
    test,
    createDsn,
    dnsLists,
    database,
    update,
    used,
    tables,
    fields,
    edit,
    editDsn,
    projectId,
    setProjectId,
    del,
    deleteProject,
    editProject,
    updateComment
  }
})
