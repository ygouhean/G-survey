import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import surveyService from '../../services/surveyService'
import responseService from '../../services/responseService'
import exportService from '../../services/exportService'
import LoadingSpinner from '../../components/LoadingSpinner'
import SurveyAssignModal from '../../components/SurveyAssignModal'

export default function SurveyView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [survey, setSurvey] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exportFilter, setExportFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

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
    // Vérifier si le sondage a été fermé automatiquement
    if (survey.autoClosedAt && survey.status === 'closed' && newStatus === 'active') {
      if (user?.role !== 'admin') {
        alert('🔒 Ce sondage a été fermé automatiquement car sa date de fin est dépassée.\n\nSeul un administrateur peut le rouvrir.')
        return
      }
      
      const confirmReopen = confirm('⚠️ Ce sondage a été fermé automatiquement car sa date de fin est dépassée.\n\nÊtes-vous sûr de vouloir le rouvrir ?')
      if (!confirmReopen) {
        return
      }
    }

    try {
      await surveyService.updateSurveyStatus(id!, newStatus)
      setSurvey({ ...survey, status: newStatus, autoClosedAt: newStatus === 'active' ? null : survey.autoClosedAt })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const getDateRange = () => {
    const today = new Date()
    let startDate = ''
    let endDate = ''

    switch (exportFilter) {
      case 'today':
        startDate = today.toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case '7days':
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 7)
        startDate = sevenDaysAgo.toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case '30days':
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 30)
        startDate = thirtyDaysAgo.toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case 'custom':
        startDate = customStartDate
        endDate = customEndDate
        break
      case 'all':
      default:
        // Pas de filtre
        break
    }

    return { startDate, endDate }
  }

  const handleExport = async (format: 'excel' | 'csv' | 'json' | 'complete') => {
    try {
      // Valider les dates personnalisées
      if (exportFilter === 'custom') {
        if (!customStartDate || !customEndDate) {
          alert('⚠️ Veuillez sélectionner les dates de début et de fin')
          return
        }
        if (new Date(customEndDate) < new Date(customStartDate)) {
          alert('⚠️ La date de fin doit être postérieure à la date de début')
          return
        }
      }

      const { startDate, endDate } = getDateRange()
      
      if (format === 'excel') {
        await exportService.exportToExcel(id!, startDate, endDate)
      } else if (format === 'csv') {
        await exportService.exportToCSV(id!, startDate, endDate)
      } else if (format === 'complete') {
        await exportService.exportComplete(id!, startDate, endDate)
      } else {
        await exportService.exportToJSON(id!, startDate, endDate)
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

      {/* Auto-Closed Warning */}
      {survey.autoClosedAt && survey.status === 'closed' && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-3xl">🔒</span>
            <div className="flex-1">
              <h3 className="font-bold text-orange-800 dark:text-orange-200 text-lg">
                Sondage fermé automatiquement
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Ce sondage a été fermé automatiquement le <strong>{new Date(survey.autoClosedAt).toLocaleDateString('fr-FR')} à {new Date(survey.autoClosedAt).toLocaleTimeString('fr-FR')}</strong> car sa date de fin a été atteinte.
              </p>
              {user?.role === 'admin' ? (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  🔓 En tant qu'administrateur, vous pouvez réactiver ce sondage en cliquant sur "Activer" ci-dessous.
                </p>
              ) : (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  🔒 Seul un administrateur peut rouvrir ce sondage.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Date de fin dépassée warning */}
      {survey.endDate && new Date(survey.endDate) < new Date() && survey.status === 'active' && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-3xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 dark:text-red-200 text-lg">
                Date de fin dépassée
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                La date de fin de ce sondage était le <strong>{new Date(survey.endDate).toLocaleDateString('fr-FR')}</strong>. Il devrait être fermé automatiquement.
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                💡 Actualisez la page pour appliquer la fermeture automatique.
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Date de fin modifiée */}
      {survey.originalEndDate && survey.endDate && new Date(survey.originalEndDate).getTime() !== new Date(survey.endDate).getTime() && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📅</span>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Date de fin prolongée
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>
                  <span className="font-medium">Date de fin originale :</span>{' '}
                  <span className="font-mono">{new Date(survey.originalEndDate).toLocaleDateString('fr-FR')}</span>
                </p>
                <p>
                  <span className="font-medium">Date de fin actuelle :</span>{' '}
                  <span className="font-mono">{new Date(survey.endDate).toLocaleDateString('fr-FR')}</span>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  ⏱️ Prolongation de {Math.ceil((new Date(survey.endDate).getTime() - new Date(survey.originalEndDate).getTime()) / (1000 * 60 * 60 * 24))} jour(s)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
            >
              <div className="text-3xl mb-2">👥</div>
              <div className="font-semibold">Assigner le sondage</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {survey.assignedTo?.length || 0} utilisateur(s) assigné(s)
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Status & Export */}
      {canEdit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Gérer le statut</h2>
            <div className="space-y-4">
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

              {/* Descriptions des statuts */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Activer le sondage</strong> : rend le questionnaire accessible et permet à vos agents de terrain et clients de soumettre leurs réponses
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <span className="text-yellow-700 dark:text-yellow-400 text-lg">⏸️</span>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Mettre en pause</strong> : suspend temporairement la collecte de réponses afin d'apporter des modifications au sondage
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <span className="text-red-600 dark:text-red-400 text-lg">🔒</span>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Fermer définitivement</strong> : clôturer la collecte de données. Les agents de terrain et clients ne pourront plus accéder ni répondre au sondage
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Exporter les données</h2>
            
            {/* Filtres de période */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Période
              </label>
              <select
                value={exportFilter}
                onChange={(e) => {
                  setExportFilter(e.target.value as any)
                  if (e.target.value !== 'custom') {
                    setCustomStartDate('')
                    setCustomEndDate('')
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="custom">Période personnalisée</option>
              </select>
            </div>

            {/* Période personnalisée */}
            {exportFilter === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
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

            <div className="space-y-3">
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
              <button
                onClick={() => handleExport('complete')}
                className="btn btn-success w-full"
                title="Exporte toutes les réponses avec les fichiers uploadés (photos, vidéos, pièces jointes) dans une archive ZIP"
              >
                📦 Export Complet (ZIP avec fichiers)
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                💡 L'export complet inclut toutes les photos, vidéos et pièces jointes uploadées par les agents
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Questions ({survey.questions.length})</h2>
        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
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
        {survey.questions.length > 3 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            ↕️ Faites défiler pour voir toutes les questions
          </p>
        )}
      </div>

      {/* Recent Responses */}
      {responses.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Réponses récentes</h2>
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
            {responses.slice(0, 10).map((response: any) => (
              <div
                key={response.id}
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
          {responses.length > 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              ↕️ Faites défiler pour voir toutes les réponses récentes
            </p>
          )}
          {responses.length > 10 && (
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

      {/* Survey Assignment Modal */}
      <SurveyAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        surveyId={id!}
        surveyCreatedById={survey.createdById || survey.createdBy?.id}
        currentlyAssigned={survey.assignedTo || []}
        onAssignComplete={loadData}
      />
    </div>
  )
}
