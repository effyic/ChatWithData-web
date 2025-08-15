import service from '@/utils/request'

class AnalysisService {
  // 获取项目列表
  getProjects() {
    return service.get('projects')
  }

  // 获取项目分析数据
  getProjectAnalysis(projectName: string) {
    return service.get(`project-analysis/by-name?project_name=${encodeURIComponent(projectName)}`)
  }
}

export default new AnalysisService()