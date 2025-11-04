import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import surveyService from '../../services/surveyService'
import responseService from '../../services/responseService'
import uploadService from '../../services/uploadService'
import LoadingSpinner from '../../components/LoadingSpinner'
import CameraCapture from '../../components/CameraCapture'
import VideoCapture from '../../components/VideoCapture'
import LocationMarker from '../../components/LocationMarker'
import AreaMeasurement from '../../components/AreaMeasurement'
import LineMeasurement from '../../components/LineMeasurement'
import { ageRanges, genderOptions, educationLevels, maritalStatus, countries } from '../../data/demographicOptions'

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

// Helper pour obtenir les options démographiques
const getDemographicOptions = (type: string = 'age') => {
  const optionsMap: Record<string, string[]> = {
    age: ageRanges,
    gender: genderOptions,
    education: educationLevels,
    marital: maritalStatus,
    country: countries,
    location: [] // Sera rempli dynamiquement ou via texte libre
  }
  return optionsMap[type] || []
}

export default function SurveyRespond() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [location, setLocation] = useState<[number, number] | null>(null)
  const [showCameraCapture, setShowCameraCapture] = useState(false)
  const [showVideoCapture, setShowVideoCapture] = useState(false)
  const [currentCaptureQuestionId, setCurrentCaptureQuestionId] = useState<string>('')
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadSurvey()
    requestLocation()
  }, [id])

  const loadSurvey = async () => {
    try {
      const response = await surveyService.getSurvey(id!)
      const surveyData = response.data
      // S'assurer que questions est toujours un tableau
      if (surveyData && (!surveyData.questions || !Array.isArray(surveyData.questions))) {
        surveyData.questions = []
      }
      setSurvey(surveyData)
    } catch (error: any) {
      logger.error('Error loading survey:', error)
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement du sondage'
      alert(`⚠️ ${errorMessage}`)
      navigate('/surveys')
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude]
          setLocation(coords)
          logger.log('Position capturée:', coords)
        },
        (error) => {
          logger.error('Error getting location:', error)
          // Si la géolocalisation est requise, afficher une alerte
          if (survey?.settings?.requireGeolocation) {
            alert('⚠️ Ce sondage nécessite votre position géographique. Veuillez autoriser la géolocalisation.')
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      if (survey?.settings?.requireGeolocation) {
        alert('❌ Votre navigateur ne supporte pas la géolocalisation.')
      }
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleEmailChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value })
    
    // Valider l'email en temps réel
    if (value.trim() === '') {
      // Effacer l'erreur si le champ est vide
      const newErrors = { ...emailErrors }
      delete newErrors[questionId]
      setEmailErrors(newErrors)
    } else if (!validateEmail(value)) {
      setEmailErrors({
        ...emailErrors,
        [questionId]: 'Format email invalide (exemple: nom@domaine.com)'
      })
    } else {
      // Email valide, effacer l'erreur
      const newErrors = { ...emailErrors }
      delete newErrors[questionId]
      setEmailErrors(newErrors)
    }
  }

  const handleSubmit = async () => {
    // Vérifier que survey et questions existent et sont valides
    if (!survey || !survey.questions || !Array.isArray(survey.questions)) {
      alert('Erreur : Le sondage n\'est pas valide')
      return
    }

    // Validate required questions
    const requiredQuestions = survey.questions.filter((q: any) => q && q.required)
    const missingAnswers = requiredQuestions.filter((q: any) => !answers[q.id])
    
    if (missingAnswers.length > 0) {
      alert('Veuillez répondre à toutes les questions requises')
      return
    }

    // Validate email questions
    const emailQuestions = survey.questions.filter((q: any) => q && q.type === 'email')
    for (const question of emailQuestions) {
      const emailValue = answers[question.id]
      if (emailValue) {
        // Regex pour valider le format email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(emailValue)) {
          alert(`❌ L'adresse email "${emailValue}" n'est pas valide.\n\nFormat attendu : exemple@domaine.com`)
          return
        }
      } else if (question.required) {
        alert(`❌ L'adresse email est requise pour la question : "${question.label}"`)
        return
      }
    }

    // Validate number questions
    const numberQuestions = survey.questions.filter((q: any) => q && q.type === 'number')
    for (const question of numberQuestions) {
      const numberValue = answers[question.id]
      if (numberValue && isNaN(numberValue)) {
        alert(`❌ La valeur "${numberValue}" n'est pas un nombre valide pour la question : "${question.label}"`)
        return
      }
    }

    // Validate geolocation if required
    if (survey.settings?.requireGeolocation && !location) {
      alert('⚠️ La géolocalisation est requise pour ce sondage. Veuillez autoriser l\'accès à votre position.')
      requestLocation() // Réessayer
      return
    }

    setSubmitting(true)
    try {
      // Format answers and upload files if needed
      const formattedAnswers = await Promise.all(
        survey.questions
          .filter((q: any) => answers[q.id] !== undefined)
          .map(async (q: any) => {
            let value = answers[q.id]

            // Si c'est une question avec fichiers (photo, video, file)
            if (['photo', 'video', 'file'].includes(q.type)) {
              if (Array.isArray(value) && value.length > 0) {
                // Vérifier si ce sont des objets File (pas encore uploadés)
                const hasFileObjects = value.some((item: any) => uploadService.isFileObject(item))
                
                if (hasFileObjects) {
                  // Filtrer seulement les File objects
                  const filesToUpload = value.filter((item: any) => uploadService.isFileObject(item))
                  
                  if (filesToUpload.length > 0) {
                    try {
                      // Uploader les fichiers
                      const uploadedFiles = await uploadService.uploadFiles(filesToUpload)
                      
                      // Remplacer les File objects par les infos uploadées
                      value = value.map((item: any) => {
                        if (uploadService.isFileObject(item)) {
                          // Trouver le fichier uploadé correspondant
                          return uploadedFiles.find((uf: any) => uf.originalName === item.name) || item
                        }
                        return item
                      })
                    } catch (uploadError: any) {
                      logger.error('Erreur upload fichiers:', uploadError)
                      const uploadErrorMessage = uploadError.response?.data?.message || uploadError.message || 'Erreur lors de l\'upload des fichiers'
                      alert(`⚠️ ${uploadErrorMessage}`)
                      setSubmitting(false)
                      return null
                    }
                  }
                }
              }
            }

            return {
              questionId: q.id,
              questionType: q.type,
              value: value
            }
          })
      )

      // Filtrer les réponses null (erreurs d'upload)
      const validAnswers = formattedAnswers.filter(a => a !== null)

      if (validAnswers.length !== formattedAnswers.length) {
        return // Une erreur d'upload s'est produite, arrêter
      }

      await responseService.submitResponse({
        survey: id!,
        answers: validAnswers,
        location: location ? {
          type: 'Point',
          coordinates: location
        } : undefined,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          online: navigator.onLine
        },
        metadata: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 0
        }
      })

      alert('✅ Réponse soumise avec succès !')
      navigate(`/surveys/${id}`)
    } catch (error: any) {
      console.error('Error submitting response:', error)
      alert(error.response?.data?.message || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!survey) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-2">Sondage non trouvé</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Le sondage demandé n'existe pas ou a été supprimé.
        </p>
        <button
          onClick={() => navigate('/surveys')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          <span className="text-lg">←</span>
          <span>Retour aux sondages</span>
        </button>
      </div>
    )
  }

  if (survey.status !== 'active') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Sondage non disponible</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Ce sondage n'est pas actuellement actif.
        </p>
        <button
          onClick={() => navigate(`/surveys/${id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          <span className="text-lg">←</span>
          <span>Retour au sondage</span>
        </button>
      </div>
    )
  }

  const progress = survey.questions && Array.isArray(survey.questions) && survey.questions.length > 0
    ? ((currentQuestion + 1) / survey.questions.length) * 100
    : 0

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(`/surveys/${id}`)}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <span className="text-xl">←</span>
          <span>Retour au sondage</span>
        </button>
      </div>

      <div className="card">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {survey.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{survey.description}</p>
        </div>

        {/* Progress */}
        {survey.settings.showProgressBar && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestion + 1} sur {survey.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div
                className="h-2 bg-primary-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Question */}
        {survey.questions && Array.isArray(survey.questions) && survey.questions.map((question: any, index: number) => (
          <div
            key={question.id}
            className={index === currentQuestion ? 'block' : 'hidden'}
          >
            <div className="mb-6">
              <label className="block text-lg font-medium mb-4">
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Text Input */}
              {question.type === 'text' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className="input"
                />
              )}

              {/* Email */}
              {question.type === 'email' && (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleEmailChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'exemple@email.com'}
                    className={`input ${
                      emailErrors[question.id] 
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500' 
                        : answers[question.id] && validateEmail(answers[question.id])
                          ? 'border-green-500 dark:border-green-500 focus:ring-green-500'
                          : ''
                    }`}
                    required={question.required}
                  />
                  {emailErrors[question.id] ? (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span>❌</span>
                      <span>{emailErrors[question.id]}</span>
                    </p>
                  ) : answers[question.id] && validateEmail(answers[question.id]) ? (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span>✅</span>
                      <span>Adresse email valide</span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      📧 Format attendu : nom@domaine.com
                    </p>
                  )}
                </div>
              )}

              {/* Number */}
              {question.type === 'number' && (
                <div>
                  <input
                    type="number"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    placeholder={question.placeholder || 'Entrez un nombre'}
                    className="input"
                    required={question.required}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    🔢 Seuls les chiffres sont autorisés
                  </p>
                </div>
              )}

              {/* Phone */}
              {question.type === 'phone' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {question.phoneConfig?.countryCode && (
                      <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-medium">
                        {question.phoneConfig.countryCode}
                      </div>
                    )}
                    <input
                      type="tel"
                      value={answers[question.id] || ''}
                      onChange={(e) => {
                        // Valider que seuls des chiffres sont saisis
                        const value = e.target.value.replace(/[^0-9]/g, '')
                        handleAnswer(question.id, value)
                      }}
                      placeholder={question.placeholder || '0712345678'}
                      className="input flex-1"
                      required={question.required}
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📞 Seuls les chiffres sont autorisés
                    {question.phoneConfig?.countryCode && ` (code ${question.phoneConfig.countryCode} ajouté automatiquement)`}
                  </p>
                </div>
              )}

              {/* NPS */}
              {question.type === 'nps' && (
                <div className="flex flex-wrap gap-2">
                  {[...Array(11)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(question.id, i)}
                      className={`w-12 h-12 rounded-lg font-semibold transition-all ${
                        answers[question.id] === i
                          ? 'bg-primary-600 text-white scale-110'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              )}

              {/* Scale */}
              {question.type === 'scale' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(() => {
                      const min = question.validation?.min || 0
                      const max = question.validation?.max || 10
                      const range = max - min + 1
                      return [...Array(range)].map((_, i) => {
                        const value = min + i
                        return (
                          <button
                            key={i}
                            onClick={() => handleAnswer(question.id, value)}
                            className={`w-12 h-12 rounded-lg font-semibold transition-all ${
                              answers[question.id] === value
                                ? 'bg-primary-600 text-white scale-110'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {value}
                          </button>
                        )
                      })
                    })()}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Min ({question.validation?.min || 0})</span>
                    {answers[question.id] !== undefined && (
                      <span className="font-medium text-primary-600 dark:text-primary-400">
                        Sélectionné: {answers[question.id]}
                      </span>
                    )}
                    <span>Max ({question.validation?.max || 10})</span>
                  </div>
                </div>
              )}

              {/* CSAT */}
              {question.type === 'csat' && (
                <div className="space-y-3">
                  <div className="flex gap-3 justify-center">
                    {(() => {
                      const emojis = getCSATEmojis(question.csatConfig?.emojiType || 'stars')
                      const labels = question.csatConfig?.labels || [
                        'Très insatisfait',
                        'Insatisfait',
                        'Neutre',
                        'Satisfait',
                        'Très satisfait'
                      ]
                      return [...Array(5)].map((_, i) => (
                        <div key={i} className="relative group flex flex-col items-center">
                          <button
                            onClick={() => handleAnswer(question.id, i + 1)}
                            className={`text-5xl transition-all transform hover:scale-110 ${
                              answers[question.id] === i + 1
                                ? 'scale-110'
                                : ''
                            } ${
                              question.csatConfig?.emojiType === 'stars'
                                ? answers[question.id] > i
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                                : ''
                            }`}
                          >
                            {emojis[i]}
                          </button>
                          {/* Tooltip on hover */}
                          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 
                                        opacity-0 group-hover:opacity-100 transition-opacity
                                        bg-gray-900 text-white text-xs rounded-lg px-3 py-2 
                                        whitespace-nowrap pointer-events-none z-10">
                            {labels[i]}
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                                          w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                  {/* Label de la sélection actuelle */}
                  {answers[question.id] && (
                    <div className="text-center text-sm font-medium text-primary-600 dark:text-primary-400">
                      {question.csatConfig?.labels?.[answers[question.id] - 1] || `Niveau ${answers[question.id]}`}
                    </div>
                  )}
                </div>
              )}

              {/* CES */}
              {question.type === 'ces' && (
                <div className="flex gap-2">
                  {[...Array(7)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(question.id, i + 1)}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        answers[question.id] === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Multiple Choice */}
              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {question.options?.map((option: string, i: number) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === option}
                        onChange={() => handleAnswer(question.id, option)}
                        className="w-5 h-5"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox */}
              {question.type === 'checkbox' && (
                <div className="space-y-3">
                  {question.maxSelections && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span>ℹ️</span>
                      <span>
                        Sélectionnez maximum {question.maxSelections} option{question.maxSelections > 1 ? 's' : ''}
                        {answers[question.id]?.length > 0 && (
                          <span className="ml-2 font-medium text-primary-600 dark:text-primary-400">
                            ({answers[question.id].length}/{question.maxSelections})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {question.options?.map((option: string, i: number) => {
                      const current = answers[question.id] || []
                      const isChecked = current.includes(option)
                      const isMaxReached = question.maxSelections && current.length >= question.maxSelections && !isChecked
                      
                      return (
                        <label
                          key={i}
                          className={`flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all ${
                            isMaxReached 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isMaxReached}
                            onChange={(e) => {
                              const current = answers[question.id] || []
                              handleAnswer(
                                question.id,
                                e.target.checked
                                  ? [...current, option]
                                  : current.filter((v: string) => v !== option)
                              )
                            }}
                            className="w-5 h-5"
                          />
                          <span>{option}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Date */}
              {question.type === 'date' && (
                <input
                  type="date"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="input"
                />
              )}

              {/* Time */}
              {question.type === 'time' && (
                <input
                  type="time"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="input"
                />
              )}

              {/* Geolocation - Multiple Points Marker */}
              {question.type === 'geolocation' && (
                <LocationMarker
                  value={answers[question.id] || []}
                  onChange={(points) => handleAnswer(question.id, points)}
                  required={question.required}
                />
              )}

              {/* Area Measurement */}
              {question.type === 'area_measurement' && (
                <AreaMeasurement
                  value={answers[question.id] || []}
                  onChange={(areas) => handleAnswer(question.id, areas)}
                  required={question.required}
                />
              )}

              {/* Line Measurement */}
              {question.type === 'line_measurement' && (
                <LineMeasurement
                  value={answers[question.id] || []}
                  onChange={(lines) => handleAnswer(question.id, lines)}
                  required={question.required}
                />
              )}

              {/* Dichotomous */}
              {question.type === 'dichotomous' && (
                <div className="grid grid-cols-2 gap-4">
                  {question.options?.map((option: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(question.id, option)}
                      className={`p-4 rounded-lg font-semibold transition-all ${
                        answers[question.id] === option
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Slider */}
              {question.type === 'slider' && (
                <div className="space-y-3">
                  <input
                    type="range"
                    min={question.sliderConfig?.min || 0}
                    max={question.sliderConfig?.max || 100}
                    step={question.sliderConfig?.step || 1}
                    value={answers[question.id] || question.sliderConfig?.min || 0}
                    onChange={(e) => handleAnswer(question.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {question.sliderConfig?.labels?.min || question.sliderConfig?.min || 0}
                    </span>
                    {question.sliderConfig?.showValue && (
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {answers[question.id] || question.sliderConfig?.min || 0}
                      </span>
                    )}
                    <span className="text-gray-600 dark:text-gray-400">
                      {question.sliderConfig?.labels?.max || question.sliderConfig?.max || 100}
                    </span>
                  </div>
                </div>
              )}

              {/* Ranking */}
              {question.type === 'ranking' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Glissez-déposez pour classer les éléments par ordre de préférence
                  </p>
                  <div className="space-y-2">
                    {(answers[question.id] || question.options || []).map((item: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400 w-8">
                          {index + 1}
                        </span>
                        <span className="flex-1">{item}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const current = [...(answers[question.id] || question.options || [])]
                              if (index > 0) {
                                [current[index], current[index - 1]] = [current[index - 1], current[index]]
                                handleAnswer(question.id, current)
                              }
                            }}
                            disabled={index === 0}
                            className="btn btn-secondary text-xs"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => {
                              const current = [...(answers[question.id] || question.options || [])]
                              if (index < current.length - 1) {
                                [current[index], current[index + 1]] = [current[index + 1], current[index]]
                                handleAnswer(question.id, current)
                              }
                            }}
                            disabled={index === (answers[question.id] || question.options || []).length - 1}
                            className="btn btn-secondary text-xs"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Demographic */}
              {question.type === 'demographic' && (
                <div>
                  {question.demographicType === 'location' ? (
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      placeholder="Entrez votre localité"
                      className="input"
                    />
                  ) : (
                    <select
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      className="input"
                    >
                      <option value="">Sélectionnez une option</option>
                      {getDemographicOptions(question.demographicType).map((option, i) => (
                        <option key={i} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Matrix */}
              {question.type === 'matrix' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"></th>
                        {question.matrixColumns?.map((col, i) => (
                          <th key={i} className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-sm">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {question.matrixRows?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="p-2 border border-gray-300 dark:border-gray-600 font-medium">
                            {row}
                          </td>
                          {question.matrixColumns?.map((col, colIndex) => (
                            <td key={colIndex} className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                              <input
                                type="radio"
                                name={`${question.id}_${rowIndex}`}
                                checked={answers[question.id]?.[rowIndex] === col}
                                onChange={() => {
                                  const newAnswers = { ...(answers[question.id] || {}) }
                                  newAnswers[rowIndex] = col
                                  handleAnswer(question.id, newAnswers)
                                }}
                                className="w-5 h-5"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Image Choice */}
              {question.type === 'image_choice' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {question.images?.map((img: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(question.id, img.label)}
                      className={`relative rounded-lg overflow-hidden transition-all ${
                        answers[question.id] === img.label
                          ? 'ring-4 ring-primary-600 scale-105'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+non+disponible'
                        }}
                      />
                      <div className={`p-3 text-center font-medium ${
                        answers[question.id] === img.label
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {img.label}
                      </div>
                      {answers[question.id] === img.label && (
                        <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-1">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Photo */}
              {question.type === 'photo' && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <div className="text-6xl mb-3">📷</div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          setCurrentCaptureQuestionId(question.id)
                          setShowCameraCapture(true)
                        }}
                        className="btn btn-primary"
                      >
                        📸 Ouvrir la caméra
                      </button>
                      <label className="btn btn-secondary cursor-pointer">
                        📁 Choisir un fichier
                        <input
                          type="file"
                          accept="image/*"
                          multiple={question.fileConfig?.multiple}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            const currentFiles = answers[question.id] || []
                            handleAnswer(question.id, [...currentFiles, ...files])
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      Taille max: {question.fileConfig?.maxSizeMB || 10} MB
                      {question.fileConfig?.multiple && ' (plusieurs photos autorisées)'}
                    </p>
                  </div>
                  {answers[question.id] && answers[question.id].length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Photos sélectionnées ({answers[question.id].length}) :</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {answers[question.id].map((file: any, i: number) => (
                          <div key={i} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              onClick={() => {
                                const newFiles = answers[question.id].filter((_: any, index: number) => index !== i)
                                handleAnswer(question.id, newFiles)
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                            <div className="text-xs truncate mt-1">{file.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video */}
              {question.type === 'video' && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <div className="text-6xl mb-3">🎥</div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          setCurrentCaptureQuestionId(question.id)
                          setShowVideoCapture(true)
                        }}
                        className="btn btn-primary"
                      >
                        🎬 Enregistrer une vidéo
                      </button>
                      <label className="btn btn-secondary cursor-pointer">
                        📁 Choisir un fichier
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/3gpp,video/x-matroska"
                          multiple={question.fileConfig?.multiple}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            const currentFiles = answers[question.id] || []
                            handleAnswer(question.id, [...currentFiles, ...files])
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      Taille max: {question.fileConfig?.maxSizeMB || 10} MB
                      {question.fileConfig?.multiple && ' (plusieurs vidéos autorisées)'}
                    </p>
                  </div>
                  {answers[question.id] && answers[question.id].length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Vidéos sélectionnées ({answers[question.id].length}) :</p>
                      <ul className="space-y-2">
                        {answers[question.id].map((file: any, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded group relative">
                            <span>🎥</span>
                            <span className="flex-1">{file.name}</span>
                            <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            <button
                              onClick={() => {
                                const newFiles = answers[question.id].filter((_: any, index: number) => index !== i)
                                handleAnswer(question.id, newFiles)
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* File Attachment */}
              {question.type === 'file' && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <div className="text-6xl mb-3">📎</div>
                    <input
                      type="file"
                      multiple={question.fileConfig?.multiple}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        handleAnswer(question.id, files)
                      }}
                      className="hidden"
                      id={`file-${question.id}`}
                    />
                    <label
                      htmlFor={`file-${question.id}`}
                      className="btn btn-primary cursor-pointer"
                    >
                      📁 Choisir un fichier
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Taille max: {question.fileConfig?.maxSizeMB || 10} MB
                      {question.fileConfig?.multiple && ' (plusieurs fichiers autorisés)'}
                    </p>
                    {question.fileConfig?.acceptedTypes && question.fileConfig.acceptedTypes.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Types acceptés : {question.fileConfig.acceptedTypes.join(', ')}
                      </p>
                    )}
                  </div>
                  {answers[question.id] && answers[question.id].length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Fichiers sélectionnés :</p>
                      <ul className="space-y-1">
                        {Array.from(answers[question.id] as FileList).map((file: any, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            <span>📄</span>
                            <span className="flex-1 truncate">{file.name}</span>
                            <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            ← Précédent
          </button>

          {currentQuestion < survey.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="btn btn-primary"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-success"
            >
              {submitting ? 'Envoi...' : '✓ Soumettre'}
            </button>
          )}
        </div>

        {/* Location Info */}
        {survey.settings?.requireGeolocation && (
          <div className={`mt-4 text-sm text-center p-3 rounded-lg ${
            location 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
          }`}>
            {location ? (
              <div className="flex items-center justify-center gap-2">
                <span>✅</span>
                <span>Position capturée (Lat: {location[1].toFixed(4)}, Lng: {location[0].toFixed(4)})</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>Géolocalisation requise - En attente d'autorisation</span>
              </div>
            )}
          </div>
        )}
        {!survey.settings?.requireGeolocation && location && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            📍 Géolocalisation activée
          </div>
        )}
      </div>

      {/* Camera Capture Modal */}
      {showCameraCapture && (
        <CameraCapture
          onCapture={(file) => {
            const currentFiles = answers[currentCaptureQuestionId] || []
            const question = survey.questions.find((q: any) => q.id === currentCaptureQuestionId)
            if (question?.fileConfig?.multiple) {
              handleAnswer(currentCaptureQuestionId, [...currentFiles, file])
            } else {
              handleAnswer(currentCaptureQuestionId, [file])
            }
            setShowCameraCapture(false)
          }}
          onClose={() => setShowCameraCapture(false)}
          maxSizeMB={survey.questions.find((q: any) => q.id === currentCaptureQuestionId)?.fileConfig?.maxSizeMB || 10}
        />
      )}

      {/* Video Capture Modal */}
      {showVideoCapture && (
        <VideoCapture
          onCapture={(file) => {
            const currentFiles = answers[currentCaptureQuestionId] || []
            const question = survey.questions.find((q: any) => q.id === currentCaptureQuestionId)
            if (question?.fileConfig?.multiple) {
              handleAnswer(currentCaptureQuestionId, [...currentFiles, file])
            } else {
              handleAnswer(currentCaptureQuestionId, [file])
            }
            setShowVideoCapture(false)
          }}
          onClose={() => setShowVideoCapture(false)}
          maxSizeMB={survey.questions.find((q: any) => q.id === currentCaptureQuestionId)?.fileConfig?.maxSizeMB || 10}
        />
      )}
    </div>
  )
}
