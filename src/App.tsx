import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect, useState } from 'react'
import { setNavigationHandler } from './utils/navigation'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Public Pages
import Landing from './pages/Landing'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Protected Pages
import Dashboard from './pages/Dashboard'
import SurveyList from './pages/surveys/SurveyList'
import SurveyCreate from './pages/surveys/SurveyCreate'
import SurveyEdit from './pages/surveys/SurveyEdit'
import SurveyView from './pages/surveys/SurveyView'
import SurveyRespond from './pages/surveys/SurveyRespond'
import MapView from './pages/MapView'
import Analytics from './pages/Analytics'
import UserManagement from './pages/admin/UserManagement'
import Settings from './pages/Settings'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'
import SplashScreen from './components/SplashScreen'

function App() {
  const { checkAuth, loading } = useAuthStore()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Vérifier si le splash screen a déjà été affiché (dans sessionStorage)
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')
    if (hasSeenSplash === 'true') {
      setShowSplash(false)
    }
  }, [])

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true')
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
      <Router>
        <AppRouterContent />
      </Router>
  )
}

// Composant interne pour configurer la navigation et les routes
function AppRouterContent() {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Configurer le handler de navigation pour les services
    setNavigationHandler((path: string) => {
      navigate(path, { replace: false })
    })
  }, [navigate])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Surveys */}
        <Route path="/surveys" element={<SurveyList />} />
        <Route path="/surveys/create" element={<SurveyCreate />} />
        
        {/* Routes spécifiques pour un sondage (doivent être AVANT la route générique /surveys/:id) */}
        <Route path="/surveys/:id/respond" element={<SurveyRespond />} />
        <Route path="/surveys/:id/edit" element={<SurveyEdit />} />
        <Route path="/surveys/:id/analytics" element={<Analytics />} />
        <Route path="/surveys/:id/map" element={<MapView />} />
        <Route path="/surveys/:id" element={<SurveyView />} />
        
        {/* Map */}
        <Route path="/map" element={<MapView />} />
        
        {/* Analytics */}
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Admin */}
        <Route path="/users" element={<UserManagement />} />
        
        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
