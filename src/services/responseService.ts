import api from './api'

export interface Response {
  id: string
  survey: string
  respondent?: any
  answers: Answer[]
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }
  deviceInfo?: {
    userAgent: string
    platform: string
    online: boolean
  }
  metadata?: {
    startTime: Date
    endTime: Date
    duration: number
    ipAddress?: string
  }
  npsScore?: number
  csatScore?: number
  cesScore?: number
  status: 'completed' | 'partial' | 'synced' | 'pending_sync'
  submittedAt: Date
}

export interface Answer {
  questionId: string
  questionType: string
  value: any
  geolocation?: {
    type: 'Point'
    coordinates: [number, number]
  }
  areaMeasurement?: {
    polygon: {
      type: 'Polygon'
      coordinates: number[][][]
    }
    hectares: number
  }
}

class ResponseService {
  async getResponses(params?: any) {
    const response = await api.get('/responses', { params })
    return response.data
  }

  async getResponse(id: string) {
    const response = await api.get(`/responses/${id}`)
    return response.data
  }

  async submitResponse(responseData: Partial<Response>) {
    const response = await api.post('/responses', responseData)
    return response.data
  }

  async getSurveyResponses(surveyId: string) {
    const response = await api.get(`/responses/survey/${surveyId}`)
    return response.data
  }

  async getMapResponses(surveyId: string, filters?: { agentId?: string, startDate?: string, endDate?: string }) {
    const params: any = {}
    if (filters?.agentId) params.agentId = filters.agentId
    if (filters?.startDate) params.startDate = filters.startDate
    if (filters?.endDate) params.endDate = filters.endDate
    
    const response = await api.get(`/responses/survey/${surveyId}/map`, { params })
    return response.data
  }

  async getMapResponsesAll(filters?: { surveyId?: string, agentId?: string, startDate?: string, endDate?: string }) {
    const params: any = {}
    if (filters?.surveyId) params.surveyId = filters.surveyId
    if (filters?.agentId) params.agentId = filters.agentId
    if (filters?.startDate) params.startDate = filters.startDate
    if (filters?.endDate) params.endDate = filters.endDate
    
    const response = await api.get('/responses/map', { params })
    return response.data
  }

  async bulkSubmitResponses(responses: Partial<Response>[]) {
    const response = await api.post('/responses/bulk', { responses })
    return response.data
  }
}

export default new ResponseService()
