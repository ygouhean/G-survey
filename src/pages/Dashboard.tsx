import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import analyticsService from '../services/analyticsService'
import surveyService from '../services/surveyService'
import LoadingSpinner from '../components/LoadingSpinner'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [recentSurveys, setRecentSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, surveysData] = await Promise.all([
        analyticsService.getDashboardStats(),
        surveyService.getSurveys()
      ])
      
      setStats(statsData.data)
      setRecentSurveys(surveysData.data.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  // Helper function to format change percentage
  const formatChange = (change: number | undefined, isNPS: boolean = false) => {
    if (change === undefined || change === null) return '+0%'
    const sign = change >= 0 ? '+' : ''
    if (isNPS) {
      // For NPS, show change with one decimal
      return `${sign}${change.toFixed(1)}%`
    }
    return `${sign}${change}%`
  }

  const statCards = [
    {
      title: 'Total Sondages',
      value: stats?.totalSurveys || 0,
      icon: '📋',
      color: 'blue',
      change: formatChange(stats?.changes?.totalSurveys) + ' ce mois'
    },
    {
      title: 'Réponses Totales',
      value: stats?.totalResponses || 0,
      icon: '📊',
      color: 'green',
      change: formatChange(stats?.changes?.totalResponses) + ' ce mois'
    },
    {
      title: 'Aujourd\'hui',
      value: stats?.responsesToday || 0,
      icon: '📈',
      color: 'purple',
      change: formatChange(stats?.changes?.responsesToday) + ' vs hier'
    },
    {
      title: 'NPS Moyen',
      value: stats?.averageNPS?.toFixed(1) || '0.0',
      icon: '⭐',
      color: 'yellow',
      change: formatChange(stats?.changes?.averageNPS, true) + ' ce mois'
    }
  ]

  const surveyStatusData = {
    labels: ['Actif', 'Brouillon', 'Pause', 'Fermé'],
    datasets: [{
      data: [
        stats?.surveysByStatus?.active || 0,
        stats?.surveysByStatus?.draft || 0,
        stats?.surveysByStatus?.paused || 0,
        stats?.surveysByStatus?.closed || 0
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderWidth: 0
    }]
  }

  const activityData = {
    labels: stats?.weeklyActivity?.labels || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Réponses',
      data: stats?.weeklyActivity?.data || [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(37, 99, 235, 0.8)',
      borderRadius: 8
    }]
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Bienvenue, {user?.firstName} ! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Voici un aperçu de vos activités de sondage
        </p>
      </div>

      {/* Message d'information pour les agents de terrain sans équipe */}
      {user?.role === 'field_agent' && !user?.teamId && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🎯 Compte créé avec succès !
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-3">
                Votre inscription a été validée. Vous avez le statut <strong>Agent de terrain</strong>.
              </p>
              <div className="bg-white dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
                <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
                  📋 Prochaines étapes :
                </p>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                  <li className="flex items-start">
                    <span className="mr-2">1️⃣</span>
                    <span>Veuillez contacter votre <strong>administrateur</strong> ou votre <strong>superviseur</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2️⃣</span>
                    <span>Ils vous assigneront à une équipe et vous donneront accès aux sondages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3️⃣</span>
                    <span>Une fois assigné, vous pourrez commencer à collecter des données sur le terrain</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>
                  En attendant, vous pouvez compléter votre profil dans la section <Link to="/settings" className="underline font-semibold hover:text-blue-900 dark:hover:text-blue-100">Paramètres</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message pour les agents assignés à une équipe */}
      {user?.role === 'field_agent' && user?.teamId && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-900 dark:text-green-100 font-medium">
                Vous êtes assigné à une équipe ! 🎉
              </p>
              <p className="text-green-800 dark:text-green-200 text-sm mt-1">
                Vous pouvez maintenant accéder aux sondages qui vous sont assignés.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const changeValue = stats?.changes?.[
            stat.title === 'Total Sondages' ? 'totalSurveys' :
            stat.title === 'Réponses Totales' ? 'totalResponses' :
            stat.title === 'Aujourd\'hui' ? 'responsesToday' :
            'averageNPS'
          ];
          const isPositive = changeValue !== undefined && changeValue >= 0;
          
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-1 ${
                    isPositive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="text-5xl">{stat.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Activité Hebdomadaire</h3>
          <Bar 
            data={activityData} 
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false }
              }
            }}
          />
        </div>

        {/* Survey Status */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Statut des Sondages</h3>
          <div className="flex justify-center">
            <div className="w-64 h-64">
              <Doughnut 
                data={surveyStatusData}
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
        </div>
      </div>

      {/* Recent Surveys */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Sondages Récents</h3>
          <Link to="/surveys" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Voir tout →
          </Link>
        </div>
        
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSurveys.map((survey) => {
                return (
                  <tr key={survey.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {survey.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(survey.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${survey.targetResponses > 0 
                                ? (survey.responseCount / survey.targetResponses) * 100 
                                : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {survey.responseCount}/{survey.targetResponses || '∞'}
                        </span>
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
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/surveys/${survey.id}`}
                          className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-primary-600 hover:text-primary-700 transition-colors"
                          title="Voir"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-lg">👁️</span>
                        </Link>
                        <Link
                          to={`/surveys/${survey.id}/analytics`}
                          className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-primary-600 hover:text-primary-700 transition-colors"
                          title="Analytics"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-lg">📊</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      {(user?.role === 'admin' || user?.role === 'supervisor') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/surveys/create" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">➕</div>
              <h3 className="text-lg font-semibold mb-2">Créer un Sondage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nouveau questionnaire avec drag & drop
              </p>
            </div>
          </Link>

          <Link to="/map" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-lg font-semibold mb-2">Vue Cartographique</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualiser les réponses sur la carte
              </p>
            </div>
          </Link>

          <Link to="/analytics" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2">Analytics Avancées</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rapports détaillés et comparaisons
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
