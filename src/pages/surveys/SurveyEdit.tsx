import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import SurveyBuilder from '../../components/SurveyBuilder'
import surveyService from '../../services/surveyService'
import LoadingSpinner from '../../components/LoadingSpinner'

// Helper pour obtenir les émojis selon le type
const getCSATEmojis = (type: string = 'stars') => {
  const emojiMap: Record<string, string[]> = {
    stars: ['⭐', '⭐', '⭐', '⭐', '⭐'],
    faces: ['😢', '😕', '😐', '🙂', '😊'],
    thumbs: ['👎', '👎', '👌', '👍', '👍'],
    hearts: ['💔', '🤍', '💛', '💚', '❤️'],
    numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
  }
  return emojiMap[type] || emojiMap.stars
}

export default function SurveyEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
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
  const [showPreview, setShowPreview] = useState(true)
  const [showAllPreview, setShowAllPreview] = useState(false)

  useEffect(() => {
    loadSurvey()
  }, [id])

  const loadSurvey = async () => {
    try {
      if (!id) {
        setLoading(false)
        navigate('/surveys', { replace: true })
        return
      }
      
      const response = await surveyService.getSurvey(id)
      const surveyData = response.data
      
      if (!surveyData) {
        throw new Error('Sondage non trouvé')
      }
      
      setSurvey(surveyData)
      setTitle(surveyData.title || '')
      setDescription(surveyData.description || '')
      setQuestions(surveyData.questions || [])
      setTargetResponses(surveyData.targetResponses || 0)
      setStartDate(surveyData.startDate ? new Date(surveyData.startDate).toISOString().split('T')[0] : '')
      setEndDate(surveyData.endDate ? new Date(surveyData.endDate).toISOString().split('T')[0] : '')
      setSettings(surveyData.settings || {
        allowAnonymous: false,
        requireGeolocation: false,
        allowOfflineSubmission: true,
        showProgressBar: true,
        randomizeQuestions: false
      })
    } catch (error: any) {
      console.error('Error loading survey:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement du sondage'
      alert(errorMessage)
      navigate('/surveys', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour ajouter une question par défaut
  const addDefaultQuestion = () => {
    const newQuestion = {
      id: `question_${Date.now()}`,
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      order: questions.length
    }
    setQuestions([...questions, newQuestion])
    // Scroll vers le bas pour voir la nouvelle question
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Le titre est requis')
      return
    }

    // Vérifier que le sondage peut être modifié
    if (survey?.status === 'active') {
      alert('❌ Vous ne pouvez modifier que les sondages en pause ou fermés.\nMettez d\'abord le sondage en pause.')
      return
    }

    // Validation des dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate) {
      const start = new Date(startDate)
      if (start < today) {
        alert('❌ La date de début ne peut pas être antérieure à aujourd\'hui')
        return
      }
    }

    if (endDate) {
      const end = new Date(endDate)
      if (end < today) {
        alert('❌ La date de fin ne peut pas être antérieure à aujourd\'hui')
        return
      }

      if (startDate) {
        const start = new Date(startDate)
        if (end < start) {
          alert('❌ La date de fin doit être égale ou postérieure à la date de début')
          return
        }
      }
    }

    setSaving(true)
    try {
      const surveyData: any = {
        title,
        description: description || null,
        questions: Array.isArray(questions) ? questions : [],
        targetResponses: targetResponses || 0,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        settings: settings || {
          allowAnonymous: false,
          requireGeolocation: false,
          allowOfflineSubmission: true,
          showProgressBar: true,
          randomizeQuestions: false
        }
      }

      // Seul l'admin peut modifier la date de fin
      if (user?.role === 'admin') {
        surveyData.endDate = endDate ? new Date(endDate).toISOString() : null
        
        // Si c'est la première fois qu'on définit une date de fin, la sauvegarder comme originale
        if (!survey.originalEndDate && endDate) {
          surveyData.originalEndDate = new Date(endDate).toISOString()
        }
      }

      await surveyService.updateSurvey(id!, surveyData)
      navigate(`/surveys/${id}`, { replace: false })
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
            onClick={() => navigate(`/surveys/${id}`, { replace: false })}
            className="btn btn-secondary"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving || survey?.status === 'active'}
            title={survey?.status === 'active' ? 'Mettez le sondage en pause pour le modifier' : ''}
          >
            💾 Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* Warning for active surveys */}
      {survey?.status === 'active' && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-3xl">🔒</span>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 dark:text-red-200 text-lg">
                Modification impossible
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Ce sondage est actuellement <strong>actif</strong>. Vous devez le mettre en <strong>pause</strong> ou le <strong>fermer</strong> avant de pouvoir le modifier.
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                💡 Retournez à la page du sondage pour changer son statut.
              </p>
            </div>
          </div>
        </div>
      )}
      {survey?.status !== 'active' && survey?.responseCount > 0 && (
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
                disabled
                className="input disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                🔒 La date de début ne peut pas être modifiée après la création
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Date de fin
                {user?.role !== 'admin' && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                    🔒 Admin uniquement
                  </span>
                )}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                disabled={survey?.status === 'active' || user?.role !== 'admin'}
                className="input disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {user?.role === 'admin' 
                  ? 'Peut être modifiée pour prolonger le sondage'
                  : '🔒 Seul un administrateur peut modifier la date de fin'
                }
              </p>
              {survey?.originalEndDate && new Date(survey.originalEndDate).getTime() !== new Date(endDate).getTime() && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                  📅 Date de fin originale : {new Date(survey.originalEndDate).toLocaleDateString('fr-FR')}
                </p>
              )}
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

      {/* Bouton "Ajouter une question" en fin de liste */}
      {questions.length > 0 && (
        <div className="card bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600 transition-colors">
          <button
            onClick={addDefaultQuestion}
            disabled={survey?.status === 'active'}
            className="w-full py-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={survey?.status === 'active' ? 'Mettez le sondage en pause pour ajouter des questions' : 'Ajouter une question de type texte'}
          >
            <span className="text-2xl">➕</span>
            <span>Ajouter une question</span>
          </button>
        </div>
      )}

      {/* Preview */}
      {questions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">📱 Prévisualisation Mobile</h2>
            <div className="flex gap-2">
              {questions.length > 2 && (
                <button
                  onClick={() => setShowAllPreview(!showAllPreview)}
                  className="btn btn-secondary text-sm"
                >
                  {showAllPreview ? '📄 Aperçu' : '📋 Voir tout'}
                </button>
              )}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn btn-secondary text-sm"
              >
                {showPreview ? '👁️ Masquer' : '👁️ Afficher'}
              </button>
            </div>
          </div>
          
          {showPreview && (
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
              {(showAllPreview ? questions : questions.slice(0, 2)).map((q) => (
                <div key={q.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <label className="block font-medium mb-2">
                    {q.label || 'Question sans titre'}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {q.type === 'text' && (
                    <input type="text" placeholder={q.placeholder} className="input" disabled />
                  )}
                  {q.type === 'number' && (
                    <div>
                      <input type="number" placeholder={q.placeholder || 'Entrez un nombre'} className="input" disabled />
                      <p className="text-xs text-gray-500 mt-1">🔢 Chiffres uniquement</p>
                    </div>
                  )}
                  {q.type === 'email' && (
                    <div>
                      <input type="email" placeholder={q.placeholder || 'exemple@email.com'} className="input" disabled />
                      <p className="text-xs text-gray-500 mt-1">📧 Email valide requis</p>
                    </div>
                  )}
                  {q.type === 'phone' && (
                    <div>
                      <div className="flex gap-2">
                        {q.phoneConfig?.countryCode && (
                          <div className="px-3 py-2 bg-gray-100 border rounded text-sm">
                            {q.phoneConfig.countryCode}
                          </div>
                        )}
                        <input type="tel" placeholder={q.placeholder || '0712345678'} className="input flex-1" disabled />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">📞 Chiffres uniquement</p>
                    </div>
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
                  {q.type === 'csat' && (
                    <div className="flex gap-2 justify-center">
                      {(() => {
                        const emojis = getCSATEmojis(q.csatConfig?.emojiType || 'stars')
                        return [...Array(5)].map((_, i) => (
                          <button key={i} className="text-3xl" disabled>
                            {emojis[i]}
                          </button>
                        ))
                      })()}
                    </div>
                  )}
                  {q.type === 'multiple_choice' && q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 mb-2">
                      <input type="radio" disabled />
                      <span>{opt || `Option ${i + 1}`}</span>
                    </label>
                  ))}
                  {q.type === 'checkbox' && (
                    <div>
                      {q.maxSelections && (
                        <div className="text-xs text-gray-500 mb-2">
                          Maximum {q.maxSelections} sélection{q.maxSelections > 1 ? 's' : ''}
                        </div>
                      )}
                      {q.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 mb-2">
                          <input type="checkbox" disabled />
                          <span>{opt || `Option ${i + 1}`}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === 'dichotomous' && (
                    <div className="grid grid-cols-2 gap-2">
                      {q.options?.map((opt, i) => (
                        <button key={i} className="btn btn-secondary text-sm" disabled>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === 'slider' && (
                    <div className="space-y-2">
                      <input type="range" disabled className="w-full" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{q.sliderConfig?.labels?.min || q.sliderConfig?.min || 0}</span>
                        <span>{q.sliderConfig?.labels?.max || q.sliderConfig?.max || 100}</span>
                      </div>
                    </div>
                  )}
                  {q.type === 'ranking' && (
                    <div className="text-xs text-gray-500">
                      Classement de {q.options?.length || 0} éléments
                    </div>
                  )}
                  {q.type === 'demographic' && (
                    <select disabled className="input text-sm">
                      <option>Type: {q.demographicType || 'age'}</option>
                    </select>
                  )}
                  {q.type === 'matrix' && (
                    <div className="text-xs text-gray-500">
                      Matrice: {q.matrixRows?.length || 0} lignes × {q.matrixColumns?.length || 0} colonnes
                    </div>
                  )}
                  {q.type === 'image_choice' && (
                    <div className="text-xs text-gray-500">
                      Choix parmi {q.images?.length || 0} images
                    </div>
                  )}
                  {q.type === 'scale' && (
                    <div className="flex gap-1 justify-center">
                      {[...Array(Math.min(5, (q.validation?.max || 10) - (q.validation?.min || 0) + 1))].map((_, i) => (
                        <button key={i} className="w-8 h-8 border rounded text-xs" disabled>
                          {(q.validation?.min || 0) + i}
                        </button>
                      ))}
                      {(q.validation?.max || 10) - (q.validation?.min || 0) + 1 > 5 && (
                        <span className="text-xs self-center">...</span>
                      )}
                    </div>
                  )}
                  {q.type === 'photo' && (
                    <div className="text-center text-xs text-gray-500">
                      📷 Capture photo ({q.fileConfig?.maxSizeMB || 10}MB max)
                    </div>
                  )}
                  {q.type === 'video' && (
                    <div className="text-center text-xs text-gray-500">
                      🎥 Capture vidéo ({q.fileConfig?.maxSizeMB || 10}MB max)
                    </div>
                  )}
                  {q.type === 'file' && (
                    <div className="text-center text-xs text-gray-500">
                      📎 Upload fichier ({q.fileConfig?.maxSizeMB || 10}MB max)
                    </div>
                  )}
                  {q.type === 'geolocation' && (
                    <div className="text-center text-xs text-gray-500">
                      🗺️ Marquage de points géographiques multiples
                    </div>
                  )}
                  {q.type === 'area_measurement' && (
                    <div className="text-center text-xs text-gray-500">
                      📐 Mesure de superficie par marquage de polygones
                    </div>
                  )}
                  {q.type === 'line_measurement' && (
                    <div className="text-center text-xs text-gray-500">
                      📏 Mesure de distance linéaire (cours d'eau, routes...)
                    </div>
                  )}
                </div>
              ))}
                {!showAllPreview && questions.length > 2 && (
                  <p className="text-center text-sm text-gray-500">
                    ... et {questions.length - 2} autres questions
                  </p>
                )}
                {showAllPreview && questions.length > 2 && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                      <span>✓</span>
                      <span>Toutes les {questions.length} questions affichées</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
