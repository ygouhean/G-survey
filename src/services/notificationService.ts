import api from './api'

export interface Notification {
  id: string
  type: 'survey_assigned' | 'survey_completed' | 'response_submitted' | 'survey_closed' | 'team_joined' | 'survey_created'
  title: string
  message: string
  userId: string
  relatedUserId?: string
  relatedSurveyId?: string
  isRead: boolean
  link?: string
  createdAt: Date
  updatedAt: Date
  actor?: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
  survey?: {
    id: string
    title: string
  }
}

class NotificationService {
  async getNotifications() {
    const response = await api.get('/notifications')
    return response.data
  }

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count')
    return response.data
  }

  async markAsRead(id: string) {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
  }

  async markAllAsRead() {
    const response = await api.put('/notifications/mark-all-read')
    return response.data
  }

  async deleteNotification(id: string) {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
  }
}

export default new NotificationService()






