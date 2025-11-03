import api from './api'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'supervisor' | 'field_agent'
  phone?: string
  teamId?: string
  isActive: boolean
}

class AuthService {
  async getAgents() {
    const response = await api.get('/auth/agents')
    return response.data
  }

  async getSupervisors() {
    const response = await api.get('/auth/supervisors')
    return response.data
  }
}

export default new AuthService()

