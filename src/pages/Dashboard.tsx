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

  const statCards = [
    {
      title: 'Total Sondages',
      value: stats?.totalSurveys || 0,
      icon: '📋',
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Réponses Totales',
      value: stats?.totalResponses || 0,
      icon: '📊',
      color: 'green',
      change: '+23%'
    },
    {
      title: 'Aujourd\'hui',
      value: stats?.responsesToday || 0,
      icon: '📈',
      color: 'purple',
      change: '+5%'
    },
    {
      title: 'NPS Moyen',
      value: stats?.averageNPS?.toFixed(1) || '0.0',
      icon: '⭐',
      color: 'yellow',
      change: '+0.3'
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
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Réponses',
      data: [65, 78, 90, 81, 56, 45, 30],
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {stat.change} ce mois
                </p>
              </div>
              <div className="text-5xl">{stat.icon}</div>
            </div>
          </div>
        ))}
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
              {recentSurveys.map((survey) => (
                <tr key={survey._id} className="border-b border-gray-100 dark:border-gray-800">
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
                        to={`/surveys/${survey._id}`}
                        className="text-primary-600 hover:text-primary-700"
                        title="Voir"
                      >
                        👁️
                      </Link>
                      <Link
                        to={`/surveys/${survey._id}/analytics`}
                        className="text-primary-600 hover:text-primary-700"
                        title="Analytics"
                      >
                        📊
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
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
