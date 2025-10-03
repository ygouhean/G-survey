import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import surveyService from '../../services/surveyService'
import responseService from '../../services/responseService'
import exportService from '../../services/exportService'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function SurveyView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [survey, setSurvey] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [surveyRes, responsesRes] = await Promise.all([
        surveyService.getSurvey(id!),
        responseService.getSurveyResponses(id!)
      ])
      
      setSurvey(surveyRes.data)
      setResponses(responsesRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await surveyService.updateSurveyStatus(id!, newStatus)
      setSurvey({ ...survey, status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const handleExport = async (format: 'excel' | 'csv' | 'json') => {
    try {
      if (format === 'excel') {
        await exportService.exportToExcel(id!)
      } else if (format === 'csv') {
        await exportService.exportToCSV(id!)
      } else {
        await exportService.exportToJSON(id!)
      }
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Erreur lors de l\'export')
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!survey) {
    return <div className="text-center py-12">Sondage non trouvé</div>
  }

  const canEdit = user?.role === 'admin' || user?.role === 'supervisor'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {survey.title}
            </h1>
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
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {survey.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Créé le {new Date(survey.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/surveys')}
            className="btn btn-secondary"
          >
            ← Retour
          </button>
          {canEdit && (
            <Link
              to={`/surveys/${id}/edit`}
              className="btn btn-primary"
            >
              ✏️ Modifier
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Réponses</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {survey.responseCount}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            / {survey.targetResponses || '∞'} cibles
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Taux de réponse</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {survey.targetResponses > 0 
              ? Math.round((survey.responseCount / survey.targetResponses) * 100)
              : 0}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{
                width: `${survey.targetResponses > 0 
                  ? Math.min((survey.responseCount / survey.targetResponses) * 100, 100)
                  : 0}%`
              }}
            ></div>
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Questions</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {survey.questions.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {survey.questions.filter((q: any) => q.required).length} requises
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Période</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {survey.startDate && survey.endDate ? (
              Math.ceil((new Date(survey.endDate).getTime() - new Date(survey.startDate).getTime()) / (1000 * 60 * 60 * 24))
            ) : (
              '∞'
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">jours</div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={`/surveys/${id}/respond`}
            className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold">Répondre au sondage</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Soumettre une nouvelle réponse
            </div>
          </Link>

          <Link
            to={`/surveys/${id}/analytics`}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold">Analytics</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Visualiser les statistiques
            </div>
          </Link>

          <Link
            to={`/surveys/${id}/map`}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <div className="text-3xl mb-2">🗺️</div>
            <div className="font-semibold">Vue cartographique</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Voir les réponses sur la carte
            </div>
          </Link>
        </div>
      </div>

      {/* Status & Export */}
      {canEdit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Gérer le statut</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange('active')}
                disabled={survey.status === 'active'}
                className="btn btn-success flex-1"
              >
                ✅ Activer
              </button>
              <button
                onClick={() => handleStatusChange('paused')}
                disabled={survey.status === 'paused'}
                className="btn btn-secondary flex-1"
              >
                ⏸️ Pause
              </button>
              <button
                onClick={() => handleStatusChange('closed')}
                disabled={survey.status === 'closed'}
                className="btn btn-danger flex-1"
              >
                🔒 Fermer
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Exporter les données</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('excel')}
                className="btn btn-primary flex-1"
              >
                📊 Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="btn btn-primary flex-1"
              >
                📄 CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="btn btn-primary flex-1"
              >
                💾 JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Questions ({survey.questions.length})</h2>
        <div className="space-y-3">
          {survey.questions.map((question: any, index: number) => (
            <div
              key={question.id}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{question.label}</span>
                    {question.required && (
                      <span className="badge badge-danger text-xs">Requis</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Type: {question.type}
                    {question.options && ` • ${question.options.length} options`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Responses */}
      {responses.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Réponses récentes</h2>
          <div className="space-y-3">
            {responses.slice(0, 5).map((response: any) => (
              <div
                key={response._id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {response.respondent 
                      ? `${response.respondent.firstName} ${response.respondent.lastName}`
                      : 'Anonyme'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(response.submittedAt).toLocaleString('fr-FR')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {response.npsScore !== undefined && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500">NPS</div>
                      <div className={`font-bold ${
                        response.npsScore >= 9 ? 'nps-promoter' :
                        response.npsScore >= 7 ? 'nps-passive' :
                        'nps-detractor'
                      }`}>
                        {response.npsScore}
                      </div>
                    </div>
                  )}
                  {response.location && (
                    <span className="text-sm">📍</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {responses.length > 5 && (
            <div className="text-center mt-4">
              <Link
                to={`/surveys/${id}/analytics`}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Voir toutes les réponses ({responses.length}) →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
