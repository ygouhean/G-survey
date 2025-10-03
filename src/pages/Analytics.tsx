import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import analyticsService from '../services/analyticsService'
import surveyService from '../services/surveyService'
import LoadingSpinner from '../components/LoadingSpinner'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
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
  const [survey, setSurvey] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [id, period])

  const loadAnalytics = async () => {
    try {
      if (id) {
        const [surveyRes, analyticsRes] = await Promise.all([
          surveyService.getSurvey(id),
          analyticsService.getSurveyAnalytics(id, period)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {survey?.title}
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {p === 'day' ? 'Jour' :
               p === 'week' ? 'Semaine' :
               p === 'month' ? 'Mois' :
               'Année'}
            </button>
          ))}
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
