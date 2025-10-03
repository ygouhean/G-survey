import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'supervisor' | 'field_agent'
  team?: any
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data.data

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          })

          // Set token in api service
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error: any) {
          set({ loading: false })
          throw new Error(error.response?.data?.message || 'Login failed')
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
        delete api.defaults.headers.common['Authorization']
      },

      checkAuth: async () => {
        const { token } = get()
        
        if (!token) {
          set({ loading: false, isAuthenticated: false })
          return
        }

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/auth/me')
          
          set({
            user: response.data.data,
            isAuthenticated: true,
            loading: false
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
          })
          delete api.defaults.headers.common['Authorization']
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...userData } })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      })
    }
  )
)
