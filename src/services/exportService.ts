import api from './api'

class ExportService {
  async exportToExcel(surveyId: string, startDate?: string, endDate?: string) {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await api.get(`/exports/survey/${surveyId}/excel`, {
      responseType: 'blob',
      params
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `survey_${surveyId}_${Date.now()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  async exportToCSV(surveyId: string, startDate?: string, endDate?: string) {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await api.get(`/exports/survey/${surveyId}/csv`, {
      responseType: 'blob',
      params
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `survey_${surveyId}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  async exportToJSON(surveyId: string, startDate?: string, endDate?: string) {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await api.get(`/exports/survey/${surveyId}/json`, {
      responseType: 'blob',
      params
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `survey_${surveyId}_${Date.now()}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  async exportComplete(surveyId: string, startDate?: string, endDate?: string) {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await api.get(`/exports/survey/${surveyId}/complete`, {
      responseType: 'blob',
      timeout: 600000, // 10 minutes pour les gros fichiers
      params
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `survey_${surveyId}_complete_${Date.now()}.zip`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}

export default new ExportService()
