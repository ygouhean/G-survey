import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SurveyBuilder from '../../components/SurveyBuilder'
import surveyService from '../../services/surveyService'

export default function SurveyCreate() {
  const navigate = useNavigate()
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
  const [saving, setSaving] = useState(false)

  const handleSave = async (status: 'draft' | 'active') => {
    if (!title.trim()) {
      alert('Le titre est requis')
      return
    }

    if (status === 'active' && questions.length === 0) {
      alert('Ajoutez au moins une question avant d\'activer le sondage')
      return
    }

    setSaving(true)
    try {
      const surveyData = {
        title,
        description,
        questions,
        status,
        targetResponses,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        settings
      }

      const response = await surveyService.createSurvey(surveyData)
      navigate(`/surveys/${response.data._id}`)
    } catch (error: any) {
      console.error('Error creating survey:', error)
      alert(error.response?.data?.message || 'Erreur lors de la création du sondage')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Créer un Sondage
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Construisez votre questionnaire avec le drag & drop
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/surveys')}
            className="btn btn-secondary"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            onClick={() => handleSave('draft')}
            className="btn btn-secondary"
            disabled={saving}
          >
            💾 Enregistrer brouillon
          </button>
          <button
            onClick={() => handleSave('active')}
            className="btn btn-success"
            disabled={saving}
          >
            🚀 Activer le sondage
          </button>
        </div>
      </div>

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
              placeholder="Ex: Enquête de satisfaction client 2024"
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
              placeholder="Décrivez l'objectif de ce sondage..."
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

      {/* Preview */}
      {questions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📱 Prévisualisation Mobile</h2>
          <div className="max-w-md mx-auto bg-gray-100 dark:bg-gray-900 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-2">{title || 'Titre du sondage'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {description || 'Description du sondage'}
            </p>
            
            {settings.showProgressBar && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Question 1 sur {questions.length}</span>
                  <span>0%</span>
                </div>
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-primary-600 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {questions.slice(0, 2).map((q) => (
                <div key={q.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <label className="block font-medium mb-2">
                    {q.label || 'Question sans titre'}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {q.type === 'text' && (
                    <input type="text" placeholder={q.placeholder} className="input" disabled />
                  )}
                  {q.type === 'nps' && (
                    <div className="flex gap-2">
                      {[...Array(11)].map((_, i) => (
                        <button key={i} className="w-10 h-10 border rounded text-sm" disabled>
                          {i}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === 'multiple_choice' && q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 mb-2">
                      <input type="radio" disabled />
                      <span>{opt || `Option ${i + 1}`}</span>
                    </label>
                  ))}
                </div>
              ))}
              {questions.length > 2 && (
                <p className="text-center text-sm text-gray-500">
                  ... et {questions.length - 2} autres questions
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
