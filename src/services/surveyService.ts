import api from './api'

export interface Survey {
  _id: string
  title: string
  description: string
  questions: Question[]
  status: 'draft' | 'active' | 'paused' | 'closed'
  targetResponses: number
  responseCount: number
  startDate?: Date
  endDate?: Date
  createdBy: any
  assignedTo: any[]
  settings: {
    allowAnonymous: boolean
    requireGeolocation: boolean
    allowOfflineSubmission: boolean
    showProgressBar: boolean
    randomizeQuestions: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  type: 'text' | 'email' | 'phone' | 'nps' | 'csat' | 'ces' | 'multiple_choice' | 'checkbox' | 'scale' | 'geolocation' | 'area_measurement' | 'date' | 'time'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  conditionalLogic?: {
    showIf: {
      questionId: string
      operator: string
      value: any
    }
  }
  order: number
}

class SurveyService {
  async getSurveys() {
    const response = await api.get('/surveys')
    return response.data
  }

  async getSurvey(id: string) {
    const response = await api.get(`/surveys/${id}`)
    return response.data
  }

  async createSurvey(surveyData: Partial<Survey>) {
    const response = await api.post('/surveys', surveyData)
    return response.data
  }

  async updateSurvey(id: string, surveyData: Partial<Survey>) {
    const response = await api.put(`/surveys/${id}`, surveyData)
    return response.data
  }

  async deleteSurvey(id: string) {
    const response = await api.delete(`/surveys/${id}`)
    return response.data
  }

  async updateSurveyStatus(id: string, status: string) {
    const response = await api.put(`/surveys/${id}/status`, { status })
    return response.data
  }

  async assignSurvey(id: string, userIds: string[]) {
    const response = await api.post(`/surveys/${id}/assign`, { userIds })
    return response.data
  }

  async duplicateSurvey(id: string) {
    const response = await api.post(`/surveys/${id}/duplicate`)
    return response.data
  }
}

export default new SurveyService()
