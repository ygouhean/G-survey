import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import analyticsService from '../services/analyticsService'
import surveyService from '../services/surveyService'
import authService from '../services/authService'
import LoadingSpinner from '../components/LoadingSpinner'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function Analytics() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Si on arrive avec un ID dans l'URL, c'est fixe
  const isFixedSurvey = Boolean(id)
  
  // Filtres
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [periodType, setPeriodType] = useState<'all' | 'day' | 'week' | 'month' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [id, periodType, selectedAgentId, customStartDate, customEndDate])

  const loadInitialData = async () => {
    try {
      const agentsRes = await authService.getAgents()
      setAgents(agentsRes.data || [])
    } catch (error) {
      console.error('Error loading agents:', error)
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
        startDate.setMonth(now.getMonth() - 1)
        endDate = new Date(now)
        break
      case 'custom':
        if (customStartDate) startDate = new Date(customStartDate)
        if (customEndDate) {
          endDate = new Date(customEndDate)
          endDate.setHours(23, 59, 59, 999)
        }
        break
      case 'all':
      default:
        // Pas de filtre de date
        return {}
    }

    return {
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined
    }
  }

  const loadAnalytics = async () => {
    try {
      if (id) {
        const { startDate, endDate } = getDateRange()
        
        console.log('📊 Analytics loadData - Filters:', {
          periodType,
          selectedAgentId,
          startDate,
          endDate,
          customStartDate,
          customEndDate
        })
        
        const [surveyRes, analyticsRes] = await Promise.all([
          surveyService.getSurvey(id),
          analyticsService.getSurveyAnalytics(id, {
            agentId: selectedAgentId || undefined,
            startDate,
            endDate
          })
        ])
        setSurvey(surveyRes.data)
        setAnalytics(analyticsRes.data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">Sélectionnez un sondage</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Les analytics s'afficheront ici
        </p>
      </div>
    )
  }

  // NPS Distribution
  const npsData = {
    labels: ['Détracteurs (0-6)', 'Passifs (7-8)', 'Promoteurs (9-10)'],
    datasets: [{
      data: [
        analytics.metrics.nps.detractors,
        analytics.metrics.nps.passives,
        analytics.metrics.nps.promoters
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderWidth: 0
    }]
  }

  // CSAT Distribution
  const csatData = {
    labels: ['1⭐', '2⭐', '3⭐', '4⭐', '5⭐'],
    datasets: [{
      label: 'Réponses',
      data: Object.values(analytics.metrics.csat.distribution || {}),
      backgroundColor: 'rgba(251, 191, 36, 0.8)',
      borderRadius: 8
    }]
  }

  // CES Distribution
  const cesData = {
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
      label: 'Réponses',
      data: Object.values(analytics.metrics.ces.distribution || {}),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 8
    }]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Bouton retour si on vient d'un sondage spécifique */}
            {isFixedSurvey && (
              <button
                onClick={() => navigate(`/surveys/${id}`)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Retour au sondage"
              >
                <span className="text-lg">←</span>
                <span>Retour</span>
              </button>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {survey?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Agent
              </label>
              <SelectWithScroll
                value={selectedAgentId}
                onChange={setSelectedAgentId}
                options={agents}
                placeholder="Tous les agents"
                renderOption={(agent) => `${agent.firstName} ${agent.lastName}`}
              />
            </div>

            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Période
              </label>
              <select
                value={periodType}
                onChange={(e) => {
                  setPeriodType(e.target.value as any)
                  if (e.target.value !== 'custom') {
                    setCustomStartDate('')
                    setCustomEndDate('')
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Toutes les périodes</option>
                <option value="day">Aujourd'hui</option>
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="custom">Période personnalisée</option>
              </select>
            </div>
          </div>

          {/* Période personnalisée */}
          {periodType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Réponses
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {analytics.overview.totalResponses}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {analytics.overview.responseRate.toFixed(1)}% du objectif
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Score NPS
          </div>
          <div className={`text-3xl font-bold ${
            analytics.metrics.nps.score >= 50 ? 'text-green-600' :
            analytics.metrics.nps.score >= 0 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {analytics.metrics.nps.score.toFixed(0)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {analytics.metrics.nps.total} réponses
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            CSAT Moyen
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            {analytics.metrics.csat.average.toFixed(1)}
            <span className="text-lg">/5</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {'⭐'.repeat(Math.round(analytics.metrics.csat.average))}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            CES Moyen
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {analytics.metrics.ces.average.toFixed(1)}
            <span className="text-lg">/7</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {analytics.metrics.ces.total} réponses
          </div>
        </div>
      </div>

      {/* NPS Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Distribution NPS</h3>
          <div className="flex justify-center">
            <div className="w-80 h-80">
              <Doughnut 
                data={npsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {analytics.metrics.nps.detractors}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Détracteurs
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics.metrics.nps.passives}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Passifs
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.metrics.nps.promoters}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Promoteurs
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Score NPS Expliqué</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  9-10
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-green-800 dark:text-green-200">
                    Promoteurs
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Clients enthousiastes et fidèles
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {((analytics.metrics.nps.promoters / analytics.metrics.nps.total) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                  7-8
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Passifs
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Satisfaits mais pas enthousiastes
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {((analytics.metrics.nps.passives / analytics.metrics.nps.total) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  0-6
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-red-800 dark:text-red-200">
                    Détracteurs
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    Clients insatisfaits
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {((analytics.metrics.nps.detractors / analytics.metrics.nps.total) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
              <div className="text-sm font-medium text-primary-800 dark:text-primary-200 mb-1">
                Calcul du NPS
              </div>
              <div className="text-xs text-primary-700 dark:text-primary-300">
                % Promoteurs - % Détracteurs = {analytics.metrics.nps.score.toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSAT & CES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Distribution CSAT</h3>
          <Bar 
            data={csatData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 }
                }
              }
            }}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Distribution CES</h3>
          <Bar 
            data={cesData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Geographic Stats */}
      {analytics.geographic.total > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Statistiques Géographiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📍</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.geographic.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Réponses géolocalisées
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold text-primary-600">
                {analytics.geographic.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Taux de géolocalisation
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <div>
                <a
                  href={`/surveys/${id}/map`}
                  className="btn btn-primary"
                >
                  Voir sur la carte
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">💡 Recommandations</h3>
        <div className="space-y-3">
          {analytics.metrics.nps.score < 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="font-semibold text-red-800 dark:text-red-200 mb-1">
                Score NPS négatif
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Analysez les retours des détracteurs et mettez en place des actions correctives immédiates.
              </div>
            </div>
          )}
          
          {analytics.metrics.csat.average < 3 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Satisfaction en dessous de la moyenne
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                Identifiez les points de friction et améliorez l'expérience client.
              </div>
            </div>
          )}

          {analytics.overview.responseRate < 50 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                Taux de réponse faible
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Relancez vos contacts ou augmentez l'engagement avec des incentives.
              </div>
            </div>
          )}

          {analytics.metrics.nps.score >= 50 && analytics.metrics.csat.average >= 4 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="font-semibold text-green-800 dark:text-green-200 mb-1">
                Excellente performance ! 🎉
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Vos clients sont satisfaits. Continuez sur cette lancée et capitalisez sur vos promoteurs.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
