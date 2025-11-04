import axios from 'axios'

// S'assurer que la baseURL se termine toujours par /api
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (!envUrl) return '/api'
  
  // Si l'URL ne se termine pas par /api, l'ajouter
  if (envUrl.endsWith('/api')) {
    return envUrl
  } else if (envUrl.endsWith('/')) {
    return `${envUrl}api`
  } else {
    return `${envUrl}/api`
  }
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
