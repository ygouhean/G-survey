import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import surveyService from '../../services/surveyService'
import responseService from '../../services/responseService'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function SurveyRespond() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [location, setLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    loadSurvey()
    requestLocation()
  }, [id])

  const loadSurvey = async () => {
    try {
      const response = await surveyService.getSurvey(id!)
      setSurvey(response.data)
    } catch (error) {
      console.error('Error loading survey:', error)
      alert('Erreur lors du chargement du sondage')
      navigate('/surveys')
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.longitude, position.coords.latitude])
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleSubmit = async () => {
    // Validate required questions
    const requiredQuestions = survey.questions.filter((q: any) => q.required)
    const missingAnswers = requiredQuestions.filter((q: any) => !answers[q.id])
    
    if (missingAnswers.length > 0) {
      alert('Veuillez répondre à toutes les questions requises')
      return
    }

    setSubmitting(true)
    try {
      const formattedAnswers = survey.questions
        .filter((q: any) => answers[q.id] !== undefined)
        .map((q: any) => ({
          questionId: q.id,
          questionType: q.type,
          value: answers[q.id]
        }))

      await responseService.submitResponse({
        survey: id!,
        answers: formattedAnswers,
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
    return <div className="text-center py-12">Sondage non trouvé</div>
  }

  if (survey.status !== 'active') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Sondage non disponible</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ce sondage n'est pas actuellement actif.
        </p>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / survey.questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto">
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
        {survey.questions.map((question: any, index: number) => (
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
                <input
                  type="email"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className="input"
                />
              )}

              {/* Phone */}
              {question.type === 'phone' && (
                <input
                  type="tel"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className="input"
                />
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

              {/* CSAT */}
              {question.type === 'csat' && (
                <div className="flex gap-3">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(question.id, i + 1)}
                      className={`text-5xl transition-all ${
                        answers[question.id] > i
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
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
                <div className="space-y-2">
                  {question.options?.map((option: string, i: number) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={(answers[question.id] || []).includes(option)}
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
                  ))}
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
        {location && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            📍 Géolocalisation activée
          </div>
        )}
      </div>
    </div>
  )
}
