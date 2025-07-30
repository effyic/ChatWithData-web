import service from '@/utils/request'

class FeedbackService {
//   列表
feedbacks(data: any) {
    return service.post('feedbacks', data )
  }
//   最新版本信息
getVersionInfo() {
    return service.get('versions/getVersionInfo' )
  }
//   阅读此版本
readVersion(data: any) {
    return service.post('versions/read', data )
  }
//   版本列表
versionsList(page:number = 1, limit: number = 100) {
  return service.get(`versions?page=${page}&limit=${limit}` )
}

  
  
}

export default new FeedbackService()
