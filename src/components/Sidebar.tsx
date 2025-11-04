import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function Sidebar({ open }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuthStore()

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const navItems = [
    {
      name: 'Tableau de bord',
      path: '/dashboard',
      icon: '📊',
      roles: ['admin', 'supervisor', 'field_agent']
    },
    {
      name: 'Sondages',
      path: '/surveys',
      icon: '📋',
      roles: ['admin', 'supervisor', 'field_agent']
    },
    {
      name: 'Carte',
      path: '/map',
      icon: '🗺️',
      roles: ['admin', 'supervisor', 'field_agent']
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: '📈',
      roles: ['admin', 'supervisor']
    },
    {
      name: 'Utilisateurs',
      path: '/users',
      icon: '👥',
      roles: ['admin']
    },
    {
      name: 'Paramètres',
      path: '/settings',
      icon: '⚙️',
      roles: ['admin', 'supervisor', 'field_agent']
    }
  ]

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  )

  return (
    <aside className={`
      ${open ? 'w-64' : 'w-20'} 
      bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
      transition-all duration-300 h-full
      shadow-lg lg:shadow-none
    `}>
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
          <h1 className={`font-bold text-primary-600 ${open ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} truncate`}>
            {open ? 'G-Survey' : 'GS'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 sm:space-y-2">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all
                text-sm sm:text-base
                ${isActive(item.path)
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
              {open && <span className="font-medium truncate">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        {user && (
          <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${!open && 'flex justify-center'}`}>
            <div className={`flex items-center gap-3 ${!open && 'flex-col'}`}>
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
