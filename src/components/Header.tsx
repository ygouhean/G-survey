import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationDropdown from './NotificationDropdown'
import notificationService from '../services/notificationService'
import { logger } from '../utils/logger'

interface HeaderProps {
  toggleSidebar: () => void
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Charger le nombre de notifications non lues
  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount()
      setUnreadCount(response.count)
    } catch (error) {
      logger.error('Erreur lors du chargement du compteur de notifications:', error)
    }
  }

  // Charger au montage et toutes les 30 secondes
  useEffect(() => {
    if (user) {
      loadUnreadCount()
      const interval = setInterval(loadUnreadCount, 30000) // 30 secondes
      return () => clearInterval(interval)
    }
  }, [user])

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Changer le thème"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown 
            isOpen={showNotifications} 
            onClose={() => {
              setShowNotifications(false)
              loadUnreadCount() // Recharger le compteur après fermeture
            }} 
          />
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-sm">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowDropdown(false)
                  navigate('/settings', { replace: false })
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ⚙️ Paramètres
              </button>
              <button
                onClick={() => {
                  logout()
                  // Utiliser navigate au lieu de window.location pour éviter les erreurs 404
                  navigate('/login')
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
