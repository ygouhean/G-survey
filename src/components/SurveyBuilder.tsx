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
  }
  order: number
}

interface SurveyBuilderProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
}

const questionTypes = [
  { value: 'text', label: 'Texte libre', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Téléphone', icon: '📞' },
  { value: 'nps', label: 'NPS (0-10)', icon: '⭐' },
  { value: 'csat', label: 'CSAT (1-5 étoiles)', icon: '😊' },
  { value: 'ces', label: 'CES (1-7)', icon: '💪' },
  { value: 'multiple_choice', label: 'Choix multiple', icon: '🔘' },
  { value: 'checkbox', label: 'Cases à cocher', icon: '☑️' },
  { value: 'scale', label: 'Échelle', icon: '📊' },
  { value: 'geolocation', label: 'Géolocalisation', icon: '📍' },
  { value: 'area_measurement', label: 'Mesure de superficie', icon: '📐' },
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
        <div className="pl-12">
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
      ...(type === 'csat' ? { validation: { min: 1, max: 5 } } : {}),
      ...(type === 'ces' ? { validation: { min: 1, max: 7 } } : {})
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
