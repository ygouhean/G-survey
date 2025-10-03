import api from './api'

class AnalyticsService {
  async getSurveyAnalytics(surveyId: string, period?: string) {
    const response = await api.get(`/analytics/survey/${surveyId}`, {
      params: { period }
    })
    return response.data
  }

  async getDashboardStats() {
    const response = await api.get('/analytics/dashboard')
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
