import api from './api'

class ExportService {
  async exportToExcel(surveyId: string) {
    const response = await api.get(`/exports/survey/${surveyId}/excel`, {
      responseType: 'blob'
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

  async exportToCSV(surveyId: string) {
    const response = await api.get(`/exports/survey/${surveyId}/csv`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `survey_${surveyId}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  async exportToJSON(surveyId: string) {
    const response = await api.get(`/exports/survey/${surveyId}/json`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `survey_${surveyId}_${Date.now()}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}

export default new ExportService()
