import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import surveyService from '../../services/surveyService'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function SurveyList() {
  const { user } = useAuthStore()
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    try {
      const response = await surveyService.getSurveys()
      setSurveys(response.data)
    } catch (error) {
      console.error('Error loading surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) return

    try {
      await surveyService.deleteSurvey(id)
      setSurveys(surveys.filter(s => s._id !== id))
    } catch (error) {
      console.error('Error deleting survey:', error)
      alert('Erreur lors de la suppression du sondage')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await surveyService.duplicateSurvey(id)
      loadSurveys()
    } catch (error) {
      console.error('Error duplicating survey:', error)
      alert('Erreur lors de la duplication du sondage')
    }
  }

  const filteredSurveys = filter === 'all' 
    ? surveys 
    : surveys.filter(s => s.status === filter)

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
      <div className="flex gap-2">
        {['all', 'active', 'draft', 'paused', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status === 'all' ? 'Tous' :
             status === 'active' ? 'Actifs' :
             status === 'draft' ? 'Brouillons' :
             status === 'paused' ? 'Pause' :
             'Fermés'}
          </button>
        ))}
      </div>

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
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun sondage trouvé
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((survey) => (
                  <tr key={survey._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <Link
                          to={`/surveys/${survey._id}`}
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
                          to={`/surveys/${survey._id}`}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Voir"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/surveys/${survey._id}/analytics`}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Analytics"
                        >
                          📊
                        </Link>
                        <Link
                          to={`/surveys/${survey._id}/map`}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Carte"
                        >
                          🗺️
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'supervisor') && (
                          <>
                            <Link
                              to={`/surveys/${survey._id}/edit`}
                              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Modifier"
                            >
                              ✏️
                            </Link>
                            <button
                              onClick={() => handleDuplicate(survey._id)}
                              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Dupliquer"
                            >
                              📋
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleDelete(survey._id)}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
