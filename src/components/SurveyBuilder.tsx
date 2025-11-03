import { useState } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Question {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    step?: number
  }
  csatConfig?: {
    emojiType: 'stars' | 'faces' | 'thumbs' | 'hearts' | 'numbers'
    labels: string[]
  }
  maxSelections?: number
  demographicType?: 'age' | 'gender' | 'education' | 'marital' | 'country' | 'location'
  matrixRows?: string[]
  matrixColumns?: string[]
  images?: Array<{ url: string; label: string }>
  sliderConfig?: {
    min: number
    max: number
    step: number
    showValue: boolean
    labels?: { min: string; max: string }
  }
  fileConfig?: {
    acceptedTypes?: string[]
    maxSizeMB?: number
    multiple?: boolean
  }
  phoneConfig?: {
    countryCode?: string
  }
  order: number
}

interface SurveyBuilderProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
}

const questionTypes = [
  { value: 'text', label: 'Texte libre', icon: '📝' },
  { value: 'number', label: 'Nombre', icon: '🔢' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Téléphone', icon: '📞' },
  { value: 'nps', label: 'NPS (0-10)', icon: '⭐' },
  { value: 'csat', label: 'CSAT (1-5 étoiles)', icon: '😊' },
  { value: 'ces', label: 'CES (1-7)', icon: '💪' },
  { value: 'multiple_choice', label: 'Choix multiple', icon: '🔘' },
  { value: 'checkbox', label: 'Cases à cocher', icon: '☑️' },
  { value: 'dichotomous', label: 'Question dichotomique', icon: '⚖️' },
  { value: 'scale', label: 'Échelle', icon: '📊' },
  { value: 'slider', label: 'Curseur de défilement', icon: '🎚️' },
  { value: 'ranking', label: 'Classement', icon: '🏆' },
  { value: 'matrix', label: 'Question matrice', icon: '⊞' },
  { value: 'image_choice', label: 'Choix d\'image', icon: '🖼️' },
  { value: 'demographic', label: 'Démographique', icon: '👥' },
  { value: 'photo', label: 'Prendre une photo', icon: '📷' },
  { value: 'video', label: 'Prendre une vidéo', icon: '🎥' },
  { value: 'file', label: 'Ajouter une pièce jointe', icon: '📎' },
  { value: 'geolocation', label: 'Géolocalisation', icon: '📍' },
  { value: 'area_measurement', label: 'Mesure de superficie', icon: '📐' },
  { value: 'line_measurement', label: 'Mesure de distance', icon: '📏' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'time', label: 'Heure', icon: '🕐' }
]

function SortableQuestion({ question, onUpdate, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [showOptions, setShowOptions] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3"
    >
      <div className="flex items-center gap-3 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          ⋮⋮
        </button>

        <div className="flex-1">
          <input
            type="text"
            value={question.label}
            onChange={(e) => onUpdate({ ...question, label: e.target.value })}
            placeholder="Question..."
            className="input"
          />
        </div>

        <select
          value={question.type}
          onChange={(e) => onUpdate({ ...question, type: e.target.value })}
          className="input w-auto"
        >
          {questionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm">Requis</span>
        </label>

        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
        >
          🗑️
        </button>
      </div>

      {/* Question-specific settings */}
      {(question.type === 'multiple_choice' || question.type === 'checkbox') && (
        <div className="pl-12 space-y-3">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-primary-600 hover:text-primary-700 mb-2"
          >
            {showOptions ? '▼' : '▶'} Options ({question.options?.length || 0})
          </button>

          {showOptions && (
            <div className="space-y-2">
              {(question.options || []).map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])]
                      newOptions[index] = e.target.value
                      onUpdate({ ...question, options: newOptions })
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => {
                      const newOptions = (question.options || []).filter((_, i) => i !== index)
                      onUpdate({ ...question, options: newOptions })
                    }}
                    className="btn btn-secondary"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  onUpdate({
                    ...question,
                    options: [...(question.options || []), '']
                  })
                }}
                className="btn btn-secondary text-sm"
              >
                + Ajouter une option
              </button>
            </div>
          )}

          {/* Max selections for checkbox */}
          {question.type === 'checkbox' && (
            <div className="mt-3">
              <label className="block text-sm font-medium mb-2">
                Nombre maximum de sélections
              </label>
              <input
                type="number"
                value={question.maxSelections || ''}
                onChange={(e) => onUpdate({
                  ...question,
                  maxSelections: e.target.value ? parseInt(e.target.value) : undefined
                })}
                min="1"
                max={question.options?.length || 10}
                placeholder="Illimité"
                className="input w-32"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Laissez vide pour permettre une sélection illimitée
              </p>
            </div>
          )}
        </div>
      )}

      {question.type === 'text' && (
        <div className="pl-12">
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
            placeholder="Placeholder..."
            className="input"
          />
        </div>
      )}

      {question.type === 'number' && (
        <div className="pl-12">
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
            placeholder="Placeholder..."
            className="input"
          />
        </div>
      )}

      {question.type === 'phone' && (
        <div className="pl-12 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Code indicatif pays (optionnel)
            </label>
            <input
              type="text"
              value={question.phoneConfig?.countryCode || ''}
              onChange={(e) => onUpdate({
                ...question,
                phoneConfig: {
                  countryCode: e.target.value
                }
              })}
              placeholder="Ex: +225, +33, +1..."
              className="input"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Le code sera affiché automatiquement et l'utilisateur ne pourra saisir que des chiffres
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Placeholder (optionnel)
            </label>
            <input
              type="text"
              value={question.placeholder || ''}
              onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
              placeholder="Ex: 0712345678"
              className="input"
            />
          </div>
        </div>
      )}

      {(question.type === 'scale' || question.type === 'nps' || question.type === 'ces') && (
        <div className="pl-12 flex gap-4">
          <div>
            <label className="block text-sm mb-1">Min</label>
            <input
              type="number"
              value={question.validation?.min || 0}
              onChange={(e) => onUpdate({
                ...question,
                validation: { ...question.validation, min: parseInt(e.target.value) }
              })}
              className="input w-20"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Max</label>
            <input
              type="number"
              value={question.validation?.max || 10}
              onChange={(e) => onUpdate({
                ...question,
                validation: { ...question.validation, max: parseInt(e.target.value) }
              })}
              className="input w-20"
            />
          </div>
        </div>
      )}

      {question.type === 'csat' && (
        <div className="pl-12 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type d'émoji</label>
            <select
              value={question.csatConfig?.emojiType || 'stars'}
              onChange={(e) => onUpdate({
                ...question,
                csatConfig: {
                  ...question.csatConfig,
                  emojiType: e.target.value as any,
                  labels: question.csatConfig?.labels || [
                    'Très insatisfait',
                    'Insatisfait',
                    'Neutre',
                    'Satisfait',
                    'Très satisfait'
                  ]
                }
              })}
              className="input"
            >
              <option value="stars">⭐ Étoiles</option>
              <option value="faces">😊 Visages</option>
              <option value="thumbs">👍 Pouces</option>
              <option value="hearts">❤️ Cœurs</option>
              <option value="numbers">🔢 Nombres</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Labels de satisfaction</label>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
              {[0, 1, 2, 3, 4].map((index) => (
                <input
                  key={index}
                  type="text"
                  value={question.csatConfig?.labels?.[index] || ''}
                  onChange={(e) => {
                    const newLabels = question.csatConfig?.labels || [
                      'Très insatisfait',
                      'Insatisfait',
                      'Neutre',
                      'Satisfait',
                      'Très satisfait'
                    ]
                    newLabels[index] = e.target.value
                    onUpdate({
                      ...question,
                      csatConfig: {
                        ...question.csatConfig,
                        emojiType: question.csatConfig?.emojiType || 'stars',
                        labels: newLabels
                      }
                    })
                  }}
                  placeholder={`Label niveau ${index + 1}`}
                  className="input"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dichotomous Question */}
      {question.type === 'dichotomous' && (
        <div className="pl-12">
          <label className="block text-sm font-medium mb-2">Type de question</label>
          <select
            value={question.options?.[0] || 'yes_no'}
            onChange={(e) => {
              const types: Record<string, string[]> = {
                'yes_no': ['Oui', 'Non'],
                'agree_disagree': ['D\'accord', 'Pas d\'accord'],
                'true_false': ['Vrai', 'Faux'],
                'custom': ['', '']
              }
              onUpdate({
                ...question,
                options: types[e.target.value] || types['yes_no']
              })
            }}
            className="input"
          >
            <option value="yes_no">Oui / Non</option>
            <option value="agree_disagree">D'accord / Pas d'accord</option>
            <option value="true_false">Vrai / Faux</option>
            <option value="custom">Personnalisé</option>
          </select>
          {question.options && question.options.length === 2 && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={question.options[0]}
                onChange={(e) => onUpdate({
                  ...question,
                  options: [e.target.value, question.options![1]]
                })}
                placeholder="Option 1"
                className="input"
              />
              <input
                type="text"
                value={question.options[1]}
                onChange={(e) => onUpdate({
                  ...question,
                  options: [question.options![0], e.target.value]
                })}
                placeholder="Option 2"
                className="input"
              />
            </div>
          )}
        </div>
      )}

      {/* Slider Question */}
      {question.type === 'slider' && (
        <div className="pl-12 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">Min</label>
              <input
                type="number"
                value={question.sliderConfig?.min || 0}
                onChange={(e) => onUpdate({
                  ...question,
                  sliderConfig: {
                    ...question.sliderConfig,
                    min: parseInt(e.target.value) || 0,
                    max: question.sliderConfig?.max || 100,
                    step: question.sliderConfig?.step || 1,
                    showValue: question.sliderConfig?.showValue ?? true
                  }
                })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Max</label>
              <input
                type="number"
                value={question.sliderConfig?.max || 100}
                onChange={(e) => onUpdate({
                  ...question,
                  sliderConfig: {
                    ...question.sliderConfig,
                    min: question.sliderConfig?.min || 0,
                    max: parseInt(e.target.value) || 100,
                    step: question.sliderConfig?.step || 1,
                    showValue: question.sliderConfig?.showValue ?? true
                  }
                })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Pas</label>
              <input
                type="number"
                value={question.sliderConfig?.step || 1}
                onChange={(e) => onUpdate({
                  ...question,
                  sliderConfig: {
                    ...question.sliderConfig,
                    min: question.sliderConfig?.min || 0,
                    max: question.sliderConfig?.max || 100,
                    step: parseInt(e.target.value) || 1,
                    showValue: question.sliderConfig?.showValue ?? true
                  }
                })}
                className="input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Label min (optionnel)</label>
              <input
                type="text"
                value={question.sliderConfig?.labels?.min || ''}
                onChange={(e) => onUpdate({
                  ...question,
                  sliderConfig: {
                    ...question.sliderConfig,
                    min: question.sliderConfig?.min || 0,
                    max: question.sliderConfig?.max || 100,
                    step: question.sliderConfig?.step || 1,
                    showValue: question.sliderConfig?.showValue ?? true,
                    labels: {
                      min: e.target.value,
                      max: question.sliderConfig?.labels?.max || ''
                    }
                  }
                })}
                placeholder="Ex: Pas du tout"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Label max (optionnel)</label>
              <input
                type="text"
                value={question.sliderConfig?.labels?.max || ''}
                onChange={(e) => onUpdate({
                  ...question,
                  sliderConfig: {
                    ...question.sliderConfig,
                    min: question.sliderConfig?.min || 0,
                    max: question.sliderConfig?.max || 100,
                    step: question.sliderConfig?.step || 1,
                    showValue: question.sliderConfig?.showValue ?? true,
                    labels: {
                      min: question.sliderConfig?.labels?.min || '',
                      max: e.target.value
                    }
                  }
                })}
                placeholder="Ex: Totalement"
                className="input"
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={question.sliderConfig?.showValue ?? true}
              onChange={(e) => onUpdate({
                ...question,
                sliderConfig: {
                  ...question.sliderConfig,
                  min: question.sliderConfig?.min || 0,
                  max: question.sliderConfig?.max || 100,
                  step: question.sliderConfig?.step || 1,
                  showValue: e.target.checked
                }
              })}
              className="w-4 h-4"
            />
            <span className="text-sm">Afficher la valeur</span>
          </label>
        </div>
      )}

      {/* Ranking Question */}
      {question.type === 'ranking' && (
        <div className="pl-12">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-primary-600 hover:text-primary-700 mb-2"
          >
            {showOptions ? '▼' : '▶'} Éléments à classer ({question.options?.length || 0})
          </button>

          {showOptions && (
            <div className="space-y-2">
              {(question.options || []).map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])]
                      newOptions[index] = e.target.value
                      onUpdate({ ...question, options: newOptions })
                    }}
                    placeholder={`Élément ${index + 1}`}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => {
                      const newOptions = (question.options || []).filter((_, i) => i !== index)
                      onUpdate({ ...question, options: newOptions })
                    }}
                    className="btn btn-secondary"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  onUpdate({
                    ...question,
                    options: [...(question.options || []), '']
                  })
                }}
                className="btn btn-secondary text-sm"
              >
                + Ajouter un élément
              </button>
            </div>
          )}
        </div>
      )}

      {/* Demographic Question */}
      {question.type === 'demographic' && (
        <div className="pl-12">
          <label className="block text-sm font-medium mb-2">Type de donnée démographique</label>
          <select
            value={question.demographicType || 'age'}
            onChange={(e) => onUpdate({
              ...question,
              demographicType: e.target.value as any
            })}
            className="input"
          >
            <option value="age">Âge</option>
            <option value="gender">Genre</option>
            <option value="education">Niveau d'éducation</option>
            <option value="marital">Situation matrimoniale</option>
            <option value="country">Pays d'origine</option>
            <option value="location">Localité</option>
          </select>
        </div>
      )}

      {/* Matrix Question */}
      {question.type === 'matrix' && (
        <div className="pl-12 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lignes (questions)</label>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
              {(question.matrixRows || []).map((row, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={row}
                    onChange={(e) => {
                      const newRows = [...(question.matrixRows || [])]
                      newRows[index] = e.target.value
                      onUpdate({ ...question, matrixRows: newRows })
                    }}
                    placeholder={`Ligne ${index + 1}`}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => {
                      const newRows = (question.matrixRows || []).filter((_, i) => i !== index)
                      onUpdate({ ...question, matrixRows: newRows })
                    }}
                    className="btn btn-secondary"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  onUpdate({
                    ...question,
                    matrixRows: [...(question.matrixRows || []), '']
                  })
                }}
                className="btn btn-secondary text-sm w-full"
              >
                + Ajouter une ligne
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Colonnes (options de réponse)</label>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
              {(question.matrixColumns || []).map((col, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={col}
                    onChange={(e) => {
                      const newCols = [...(question.matrixColumns || [])]
                      newCols[index] = e.target.value
                      onUpdate({ ...question, matrixColumns: newCols })
                    }}
                    placeholder={`Colonne ${index + 1}`}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => {
                      const newCols = (question.matrixColumns || []).filter((_, i) => i !== index)
                      onUpdate({ ...question, matrixColumns: newCols })
                    }}
                    className="btn btn-secondary"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  onUpdate({
                    ...question,
                    matrixColumns: [...(question.matrixColumns || []), '']
                  })
                }}
                className="btn btn-secondary text-sm w-full"
              >
                + Ajouter une colonne
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Choice Question */}
      {question.type === 'image_choice' && (
        <div className="pl-12">
          <label className="block text-sm font-medium mb-2">Images</label>
          <div className="space-y-3">
            {(question.images || []).map((img, index) => (
              <div key={index} className="flex gap-2 p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={img.url}
                    onChange={(e) => {
                      const newImages = [...(question.images || [])]
                      newImages[index] = { ...newImages[index], url: e.target.value }
                      onUpdate({ ...question, images: newImages })
                    }}
                    placeholder="URL de l'image"
                    className="input"
                  />
                  <input
                    type="text"
                    value={img.label}
                    onChange={(e) => {
                      const newImages = [...(question.images || [])]
                      newImages[index] = { ...newImages[index], label: e.target.value }
                      onUpdate({ ...question, images: newImages })
                    }}
                    placeholder="Label de l'image"
                    className="input"
                  />
                </div>
                <button
                  onClick={() => {
                    const newImages = (question.images || []).filter((_, i) => i !== index)
                    onUpdate({ ...question, images: newImages })
                  }}
                  className="btn btn-secondary"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                onUpdate({
                  ...question,
                  images: [...(question.images || []), { url: '', label: '' }]
                })
              }}
              className="btn btn-secondary text-sm"
            >
              + Ajouter une image
            </button>
          </div>
        </div>
      )}

      {/* Photo/Video/File Configuration */}
      {(question.type === 'photo' || question.type === 'video' || question.type === 'file') && (
        <div className="pl-12 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Taille maximale (MB)
            </label>
            <input
              type="number"
              value={question.fileConfig?.maxSizeMB || 10}
              onChange={(e) => onUpdate({
                ...question,
                fileConfig: {
                  ...question.fileConfig,
                  maxSizeMB: parseInt(e.target.value) || 10,
                  acceptedTypes: question.fileConfig?.acceptedTypes || [],
                  multiple: question.fileConfig?.multiple || false
                }
              })}
              min="1"
              max="100"
              className="input w-32"
            />
          </div>

          {question.type === 'file' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Types de fichiers acceptés
              </label>
              <div className="space-y-2">
                {['Documents (.pdf, .doc, .docx)', 'Images (.jpg, .png, .gif)', 'Vidéos (.mp4, .avi)', 'Audio (.mp3, .wav)', 'Tableurs (.xls, .xlsx, .csv)'].map((type, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(question.fileConfig?.acceptedTypes || []).includes(type)}
                      onChange={(e) => {
                        const current = question.fileConfig?.acceptedTypes || []
                        onUpdate({
                          ...question,
                          fileConfig: {
                            ...question.fileConfig,
                            maxSizeMB: question.fileConfig?.maxSizeMB || 10,
                            multiple: question.fileConfig?.multiple || false,
                            acceptedTypes: e.target.checked
                              ? [...current, type]
                              : current.filter(t => t !== type)
                          }
                        })
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={question.fileConfig?.multiple || false}
              onChange={(e) => onUpdate({
                ...question,
                fileConfig: {
                  ...question.fileConfig,
                  maxSizeMB: question.fileConfig?.maxSizeMB || 10,
                  acceptedTypes: question.fileConfig?.acceptedTypes || [],
                  multiple: e.target.checked
                }
              })}
              className="w-4 h-4"
            />
            <span className="text-sm">Autoriser plusieurs fichiers</span>
          </label>
        </div>
      )}
    </div>
  )
}

export default function SurveyBuilder({ questions, onChange }: SurveyBuilderProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)

      const reordered = arrayMove(questions, oldIndex, newIndex).map((q, i) => ({
        ...q,
        order: i
      }))
      onChange(reordered)
    }
  }

  const addQuestion = (type: string) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      label: '',
      required: false,
      order: questions.length,
      ...(type === 'multiple_choice' || type === 'checkbox' ? { options: [''] } : {}),
      ...(type === 'nps' ? { validation: { min: 0, max: 10 } } : {}),
      ...(type === 'csat' ? { 
        validation: { min: 1, max: 5 },
        csatConfig: {
          emojiType: 'stars',
          labels: [
            'Très insatisfait',
            'Insatisfait',
            'Neutre',
            'Satisfait',
            'Très satisfait'
          ]
        }
      } : {}),
      ...(type === 'ces' ? { validation: { min: 1, max: 7 } } : {}),
      ...(type === 'dichotomous' ? { options: ['Oui', 'Non'] } : {}),
      ...(type === 'slider' ? { 
        sliderConfig: {
          min: 0,
          max: 100,
          step: 1,
          showValue: true
        }
      } : {}),
      ...(type === 'ranking' ? { options: [''] } : {}),
      ...(type === 'demographic' ? { demographicType: 'age' } : {}),
      ...(type === 'matrix' ? { 
        matrixRows: [''],
        matrixColumns: ['']
      } : {}),
      ...(type === 'image_choice' ? { images: [{ url: '', label: '' }] } : {}),
      ...(type === 'photo' || type === 'video' || type === 'file' ? {
        fileConfig: {
          maxSizeMB: 10,
          acceptedTypes: [],
          multiple: false
        }
      } : {}),
      ...(type === 'scale' ? { validation: { min: 0, max: 10 } } : {})
    }
    onChange([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updatedQuestion: Question) => {
    onChange(questions.map((q) => (q.id === id ? updatedQuestion : q)))
  }

  const deleteQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Question Type Palette */}
      <div className="card">
        <h3 className="font-semibold mb-3">➕ Ajouter une question</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {questionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => addQuestion(type.value)}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
              title={type.label}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-xs">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      {questions.length === 0 ? (
        <div className="card text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-4">📋</p>
          <p>Aucune question ajoutée. Commencez par ajouter une question ci-dessus.</p>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            {questions.map((question) => (
              <SortableQuestion
                key={question.id}
                question={question}
                onUpdate={(updated: Question) => updateQuestion(question.id, updated)}
                onDelete={() => deleteQuestion(question.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
