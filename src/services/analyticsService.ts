import api from './api'

class AnalyticsService {
  async getSurveyAnalytics(surveyId: string, filters?: { period?: string, agentId?: string, startDate?: string, endDate?: string }) {
    const params: any = {}
    if (filters?.period) params.period = filters.period
    if (filters?.agentId) params.agentId = filters.agentId
    if (filters?.startDate) params.startDate = filters.startDate
    if (filters?.endDate) params.endDate = filters.endDate
    
    const response = await api.get(`/analytics/survey/${surveyId}`, { params })
    return response.data
  }

  async getDashboardStats(period?: string, startDate?: string, endDate?: string) {
    const params: any = {}
    if (period) params.period = period
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await api.get('/analytics/dashboard', { params })
    return response.data
  }

  async compareSurveys(surveyIds: string[]) {
    const response = await api.get('/analytics/comparison', {
      params: { surveyIds: surveyIds.join(',') }
    })
    return response.data
  }
}

export default new AnalyticsService()
