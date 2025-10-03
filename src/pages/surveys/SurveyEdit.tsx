import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SurveyBuilder from '../../components/SurveyBuilder'
import surveyService from '../../services/surveyService'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function SurveyEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<any[]>([])
  const [targetResponses, setTargetResponses] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [settings, setSettings] = useState({
    allowAnonymous: false,
    requireGeolocation: false,
    allowOfflineSubmission: true,
    showProgressBar: true,
    randomizeQuestions: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSurvey()
  }, [id])

  const loadSurvey = async () => {
    try {
      const response = await surveyService.getSurvey(id!)
      const surveyData = response.data
      
      setSurvey(surveyData)
      setTitle(surveyData.title)
      setDescription(surveyData.description || '')
      setQuestions(surveyData.questions)
      setTargetResponses(surveyData.targetResponses)
      setStartDate(surveyData.startDate ? new Date(surveyData.startDate).toISOString().split('T')[0] : '')
      setEndDate(surveyData.endDate ? new Date(surveyData.endDate).toISOString().split('T')[0] : '')
      setSettings(surveyData.settings)
    } catch (error) {
      console.error('Error loading survey:', error)
      alert('Erreur lors du chargement du sondage')
      navigate('/surveys')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Le titre est requis')
      return
    }

    setSaving(true)
    try {
      const surveyData = {
        title,
        description,
        questions,
        targetResponses,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        settings
      }

      await surveyService.updateSurvey(id!, surveyData)
      navigate(`/surveys/${id}`)
    } catch (error: any) {
      console.error('Error updating survey:', error)
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour du sondage')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Modifier le Sondage
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {survey?.title}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/surveys/${id}`)}
            className="btn btn-secondary"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
          >
            💾 Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* Warning for active surveys */}
      {survey?.status === 'active' && survey?.responseCount > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Attention !
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Ce sondage a déjà reçu {survey.responseCount} réponses. Modifier les questions peut affecter l'analyse des données.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Titre du sondage *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre de réponses cibles
              </label>
              <input
                type="number"
                value={targetResponses}
                onChange={(e) => setTargetResponses(parseInt(e.target.value) || 0)}
                min="0"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Paramètres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'allowAnonymous', label: 'Autoriser les réponses anonymes', icon: '👤' },
            { key: 'requireGeolocation', label: 'Exiger la géolocalisation', icon: '📍' },
            { key: 'allowOfflineSubmission', label: 'Autoriser la soumission hors ligne', icon: '📶' },
            { key: 'showProgressBar', label: 'Afficher la barre de progression', icon: '📊' },
            { key: 'randomizeQuestions', label: 'Randomiser l\'ordre des questions', icon: '🔀' }
          ].map((setting) => (
            <label key={setting.key} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={settings[setting.key as keyof typeof settings]}
                onChange={(e) => setSettings({
                  ...settings,
                  [setting.key]: e.target.checked
                })}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <span className="mr-2">{setting.icon}</span>
                <span className="font-medium">{setting.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Question Builder */}
      <SurveyBuilder questions={questions} onChange={setQuestions} />
    </div>
  )
}
