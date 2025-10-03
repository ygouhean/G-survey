import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Login from './pages/auth/Login'
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

function App() {
  const { checkAuth, loading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Surveys */}
          <Route path="/surveys" element={<SurveyList />} />
          <Route path="/surveys/create" element={<ProtectedRoute roles={['admin', 'supervisor']}><SurveyCreate /></ProtectedRoute>} />
          <Route path="/surveys/:id/edit" element={<ProtectedRoute roles={['admin', 'supervisor']}><SurveyEdit /></ProtectedRoute>} />
          <Route path="/surveys/:id" element={<SurveyView />} />
          <Route path="/surveys/:id/respond" element={<SurveyRespond />} />
          
          {/* Map */}
          <Route path="/map" element={<MapView />} />
          <Route path="/surveys/:id/map" element={<MapView />} />
          
          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/surveys/:id/analytics" element={<Analytics />} />
          
          {/* Admin */}
          <Route path="/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
          
          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
