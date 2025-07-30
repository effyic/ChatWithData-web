import service from '@/utils/request'

class QuestionService {


  sessionsMsg(id: number) {
    return service.get(`sessions/${id}/messages`)
  }
  sessionsList() {
    return service.get(`sessions`)
  }
  getProjects() {
    return service.get(`projects`)
  }
  deleteSession(id: number) {
    return service.delete(`sessions/${id}`)
  }
  updateSession(id: number, data: any) {
    return service.put(`sessions/${id}`, data)
  }
  createSession(data: any) {
    return service.post(`sessions`, data)
  }
  //语音转文字 AsrText
  transcriptions(data: any) {
    return service.post("AsrText", data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
      },
    });
  }
  // 获取tab
  getTabs() {
    return service.get(`analysis/tab-match`)
  }
   // 清除
   deleteTabs() {
    return service.delete(`analysis/tab-match`)
  }
}

export default new QuestionService()
