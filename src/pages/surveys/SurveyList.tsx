import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import surveyService from '../../services/surveyService'
import authService from '../../services/authService'
import LoadingSpinner from '../../components/LoadingSpinner'
import SurveyAssignModal from '../../components/SurveyAssignModal'
import { logger } from '../../utils/logger'

// Custom Select Component with Scroll
function SelectWithScroll({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  renderOption 
}: { 
  value: string
  onChange: (value: string) => void
  options: any[]
  placeholder: string
  renderOption: (item: any) => string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedItem = options.find(opt => opt.id === value)
  const displayValue = selectedItem ? renderOption(selectedItem) : placeholder

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <div className="flex items-center justify-between">
          <span className={!value ? 'text-gray-500 dark:text-gray-400' : ''}>
            {displayValue}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollable-dropdown" style={{ zIndex: 10000 }}>
          <button
            type="button"
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
          >
            {placeholder}
          </button>
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${
                  option.id === value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {renderOption(option)}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              Aucune option disponible
            </div>
          )}
          {options.length > 5 && (
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-600">
              {options.length} éléments au total
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SurveyList() {
  const { user } = useAuthStore()
  const [surveys, setSurveys] = useState<any[]>([])
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [supervisorFilter, setSupervisorFilter] = useState('')
  const [periodType, setPeriodType] = useState<'all' | 'day' | 'week' | 'month' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [assignModalSurvey, setAssignModalSurvey] = useState<any>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const surveysResponse = await surveyService.getSurveys()
      logger.log('📋 Sondages chargés:', surveysResponse.data)
      setSurveys(surveysResponse.data)
      
      // Charger les superviseurs si l'utilisateur est admin
      if (user?.role === 'admin') {
        try {
          const supervisorsResponse = await authService.getSupervisors()
          logger.log('👥 Superviseurs chargés:', supervisorsResponse.data)
          setSupervisors(supervisorsResponse.data || [])
        } catch (error) {
          logger.error('Error loading supervisors:', error)
        }
      }
    } catch (error) {
      logger.error('Error loading surveys:', error)
      alert('⚠️ Erreur lors du chargement des sondages. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    let startDate: Date | null = null
    let endDate: Date | null = null

    switch (periodType) {
      case 'day':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        endDate = new Date(now)
        break
      case 'month':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        endDate = new Date(now)
        break
      case 'custom':
        if (customStartDate) startDate = new Date(customStartDate)
        if (customEndDate) {
          endDate = new Date(customEndDate)
          endDate.setHours(23, 59, 59, 999)
        }
        break
    }

    return { startDate, endDate }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) return

    try {
      await surveyService.deleteSurvey(id)
      setSurveys(surveys.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting survey:', error)
      alert('Erreur lors de la suppression du sondage')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await surveyService.duplicateSurvey(id)
      loadInitialData()
    } catch (error: any) {
      logger.error('Error duplicating survey:', error)
      const errorMessage = error.response?.data?.message || 'Erreur lors de la duplication du sondage'
      alert(`⚠️ ${errorMessage}`)
    }
  }

  const filteredSurveys = surveys.filter(survey => {
    // Filtre par recherche (titre)
    if (searchQuery && !survey.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filtre par statut
    if (filter !== 'all' && survey.status !== filter) {
      return false
    }

    // Filtre par superviseur (créateur)
    if (supervisorFilter && survey.createdBy?.id !== supervisorFilter) {
      return false
    }

    // Filtre par date de création
    if (periodType !== 'all') {
      const { startDate, endDate } = getDateRange()
      const surveyCreatedAt = new Date(survey.createdAt)

      if (startDate && surveyCreatedAt < startDate) {
        return false
      }
      if (endDate && surveyCreatedAt > endDate) {
        return false
      }
    }

    return true
  })

  // Calculer les compteurs pour chaque statut
  const getCounts = () => {
    const baseSurveys = surveys.filter(survey => {
      // Filtre par superviseur
      if (supervisorFilter && survey.createdBy?.id !== supervisorFilter) {
        return false
      }

      // Filtre par date de création
      if (periodType !== 'all') {
        const { startDate, endDate } = getDateRange()
        const surveyCreatedAt = new Date(survey.createdAt)

        if (startDate && surveyCreatedAt < startDate) {
          return false
        }
        if (endDate && surveyCreatedAt > endDate) {
          return false
        }
      }

      return true
    })

    return {
      all: baseSurveys.length,
      active: baseSurveys.filter(s => s.status === 'active').length,
      draft: baseSurveys.filter(s => s.status === 'draft').length,
      paused: baseSurveys.filter(s => s.status === 'paused').length,
      closed: baseSurveys.filter(s => s.status === 'closed').length
    }
  }

  const counts = getCounts()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sondages
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos questionnaires et collectez des données
          </p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <Link to="/surveys/create" className="btn btn-primary">
            ➕ Créer un Sondage
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Filtres par statut et Barre de recherche */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Filtres par statut */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'draft', 'paused', 'closed'].map((status) => {
              const statusCount = counts[status as keyof typeof counts]
              const statusLabel = status === 'all' ? 'Tous' :
                                 status === 'active' ? 'Actifs' :
                                 status === 'draft' ? 'Brouillons' :
                                 status === 'paused' ? 'Pause' :
                                 'Fermés'
              
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {statusLabel} <span className={`ml-1 ${
                    filter === status 
                      ? 'text-white/90' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>({statusCount})</span>
                </button>
              )
            })}
          </div>

          {/* Barre de recherche */}
          <div className="relative w-full lg:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full lg:w-[300px] px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                title="Effacer la recherche"
              >
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filtres avancés */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtre par superviseur */}
            {user?.role === 'admin' && supervisors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Superviseur
                </label>
                <SelectWithScroll
                  value={supervisorFilter}
                  onChange={setSupervisorFilter}
                  options={supervisors}
                  placeholder="Tous les superviseurs"
                  renderOption={(supervisor) => `${supervisor.firstName} ${supervisor.lastName}`}
                />
              </div>
            )}

            {/* Filtre par période de création */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de création
              </label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Toutes les périodes</option>
                <option value="day">Aujourd'hui</option>
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="custom">Période personnalisée</option>
              </select>
            </div>

            {/* Dates personnalisées */}
            {periodType === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      {searchQuery && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">{filteredSurveys.length}</span> résultat{filteredSurveys.length > 1 ? 's' : ''} trouvé{filteredSurveys.length > 1 ? 's' : ''} pour "{searchQuery}"
          </p>
        </div>
      )}

      {/* Survey List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nom du sondage
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Réponses
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Statut
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Période
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Date de création
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Créé par
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun sondage trouvé
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <Link
                          to={`/surveys/${survey.id}`}
                          className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600"
                        >
                          {survey.title}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {survey.description?.substring(0, 50)}
                          {survey.description?.length > 50 && '...'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {survey.responseCount}/{survey.targetResponses || '∞'}
                        </span>
                        {survey.targetResponses > 0 && (
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min((survey.responseCount / survey.targetResponses) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        survey.status === 'active' ? 'badge-success' :
                        survey.status === 'draft' ? 'badge-info' :
                        survey.status === 'paused' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {survey.status === 'active' ? 'Actif' :
                         survey.status === 'draft' ? 'Brouillon' :
                         survey.status === 'paused' ? 'Pause' :
                         'Fermé'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {survey.startDate && survey.endDate ? (
                        <>
                          {Math.ceil((new Date(survey.endDate).getTime() - new Date(survey.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                        </>
                      ) : (
                        'Non défini'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/surveys/${survey.id}`}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Voir"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/surveys/${survey.id}/analytics`}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Analytics"
                        >
                          📊
                        </Link>
                        <Link
                          to={`/surveys/${survey.id}/map`}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Carte"
                        >
                          🗺️
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'supervisor') && (
                          <>
                            <button
                              onClick={() => setAssignModalSurvey(survey)}
                              className="p-2 rounded hover:bg-purple-100 dark:hover:bg-purple-900/20"
                              title={`Assigner (${survey.assignedTo?.length || 0} utilisateurs)`}
                            >
                              👥
                            </button>
                            <Link
                              to={`/surveys/${survey.id}/edit`}
                              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Modifier"
                            >
                              ✏️
                            </Link>
                            <button
                              onClick={() => handleDuplicate(survey.id)}
                              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Dupliquer"
                            >
                              📋
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleDelete(survey.id)}
                                className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {survey.createdAt ? (
                        <>
                          {new Date(survey.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(survey.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </>
                      ) : (
                        'Non défini'
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {survey.createdBy ? (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {survey.createdBy.firstName} {survey.createdBy.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {survey.createdBy.email}
                          </div>
                        </div>
                      ) : (
                        'Non défini'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Survey Assignment Modal */}
      {assignModalSurvey && (
        <SurveyAssignModal
          isOpen={!!assignModalSurvey}
          onClose={() => setAssignModalSurvey(null)}
          surveyId={assignModalSurvey.id}
          surveyCreatedById={assignModalSurvey.createdById || assignModalSurvey.createdBy?.id}
          currentlyAssigned={assignModalSurvey.assignedTo || []}
          onAssignComplete={() => {
            loadInitialData()
            setAssignModalSurvey(null)
          }}
        />
      )}
    </div>
  )
}
