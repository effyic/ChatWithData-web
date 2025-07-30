import service from '@/utils/request'

class generateReportService {

  // 创建草稿
  createArticles(data: any) {
    return service.post(`articles`, data)
  }

  // 图表上传
  uploadCharts(id: number, data: any) {
    return service.postForm(`articles/${id}/charts`, data)
  }

  // 文章问答历史记录
  getArticlesHistory(id: number) {
    return service.get(`articles/${id}/qa/history`)
  }

  // 更新文章
  articlesDone(id: number, data: any) {
    return service.put(`articles/${id}`, data)
  }

  // word转pdf
  uploadWordToPdf(data: any) {
    return service.postForm(`/upload/word-to-pdf`, data, {
      responseType: 'blob',
    })
  }
}

export default new generateReportService()
