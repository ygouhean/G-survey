import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username?: string
  phone?: string
  gender?: string
  country?: string
  sector?: string
  organizationType?: string
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
  setAuth: (user: User, token: string) => void
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
          
          // Vérifier que la réponse contient les données attendues
          if (!response.data || !response.data.data) {
            throw new Error('Réponse invalide du serveur')
          }

          const { user, token } = response.data.data

          // Vérifier que user et token sont présents
          if (!user || !token) {
            throw new Error('Données d\'authentification manquantes dans la réponse')
          }

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          })

          // Set token in api service
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error: any) {
          set({ 
            loading: false,
            user: null,
            token: null,
            isAuthenticated: false
          })
          throw new Error(error.response?.data?.message || error.message || 'Adresse e-mail ou mot de passe incorrect')
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
      },

      setAuth: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          loading: false
        })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
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
