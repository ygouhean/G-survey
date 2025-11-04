import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useState, useEffect } from 'react'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Gérer la sidebar sur mobile/tablette
  useEffect(() => {
    const handleResize = () => {
      // Sur mobile (< 768px), fermer la sidebar par défaut
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        // Sur desktop, ouvrir la sidebar par défaut
        setSidebarOpen(true)
      }
    }

    // Définir l'état initial
    handleResize()

    // Écouter les changements de taille
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar avec overlay sur mobile */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
      
      {/* Overlay pour fermer la sidebar sur mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
