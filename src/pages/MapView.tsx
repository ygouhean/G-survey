import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import responseService from '../services/responseService'
import surveyService from '../services/surveyService'
import authService from '../services/authService'
import LoadingSpinner from '../components/LoadingSpinner'
import { logger } from '../utils/logger'
import 'leaflet/dist/leaflet.css'

// Custom Select Component with Scroll
function SelectWithScroll({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  renderOption 
}: { 
  value: string
  onChange: (value: string) => void
  options: any[]
  placeholder: string
  renderOption: (item: any) => string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedItem = options.find(opt => opt.id === value)
  const displayValue = selectedItem ? renderOption(selectedItem) : placeholder

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <div className="flex items-center justify-between">
          <span className={!value ? 'text-gray-500 dark:text-gray-400' : ''}>
            {displayValue}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollable-dropdown" style={{ zIndex: 10000 }}>
          <button
            type="button"
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
          >
            {placeholder}
          </button>
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${
                  option.id === value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {renderOption(option)}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              Aucune option disponible
            </div>
          )}
          {options.length > 5 && (
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-600">
              {options.length} éléments au total
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Types de cartes disponibles
type MapType = 'osm' | 'satellite' | 'satellite-hybrid'

const MAP_TYPES: Record<MapType, { name: string, url: string, attribution: string }> = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  },
  'satellite-hybrid': {
    name: 'Satellite avec Labels',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> | &copy; OpenStreetMap'
  }
}

// Custom marker icons based on NPS score
const createMarkerIcon = (score?: number) => {
  let color = '#3B82F6' // default blue
  
  if (score !== undefined) {
    if (score >= 9) color = '#10B981' // green (promoter)
    else if (score >= 7) color = '#F59E0B' // orange (passive)
    else color = '#EF4444' // red (detractor)
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function MapUpdater({ center, zoom, shouldUpdate }: { center: [number, number], zoom: number, shouldUpdate: boolean }) {
  const map = useMap()
  const isInitialMount = useRef(true)
  const lastCenter = useRef<[number, number]>(center)
  const lastZoom = useRef<number>(zoom)
  
  useEffect(() => {
    // Ne pas forcer le zoom/center si l'utilisateur a interagi avec la carte
    // Seulement lors du chargement initial ou si shouldUpdate est true
    if (isInitialMount.current) {
      map.setView(center, zoom)
      lastCenter.current = center
      lastZoom.current = zoom
      isInitialMount.current = false
    } else if (shouldUpdate) {
      // Vérifier si les valeurs ont vraiment changé
      const centerChanged = center[0] !== lastCenter.current[0] || center[1] !== lastCenter.current[1]
      const zoomChanged = zoom !== lastZoom.current
      
      if (centerChanged || zoomChanged) {
        map.setView(center, zoom)
        lastCenter.current = center
        lastZoom.current = zoom
      }
    }
  }, [center, zoom, map, shouldUpdate])
  
  return null
}

// Composant pour changer le type de carte avec labels
function LabelsOverlay({ mapType }: { mapType: MapType }) {
  const map = useMap()
  
  useEffect(() => {
    if (mapType === 'satellite-hybrid') {
      // Ajouter une couche de labels OpenStreetMap par-dessus le satellite
      const labelsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        opacity: 0.7,
        pane: 'overlayPane'
      })
      labelsLayer.addTo(map)
      
      return () => {
        map.removeLayer(labelsLayer)
      }
    }
  }, [mapType, map])
  
  return null
}

export default function MapView() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<any>(null)
  const [surveys, setSurveys] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [realtimeEnabled, setRealtimeEnabled] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Si on arrive avec un ID dans l'URL, c'est fixe (on ne peut pas le changer)
  const isFixedSurvey = Boolean(id)
  
  // Filtres
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(id || '')
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [periodType, setPeriodType] = useState<'all' | 'day' | 'week' | 'month' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  
  // Filtres NPS
  const [filter, setFilter] = useState<'all' | 'promoters' | 'passives' | 'detractors'>('all')
  
  // Type de carte
  const [mapType, setMapType] = useState<MapType>('osm')
  
  const [center, setCenter] = useState<[number, number]>([48.8566, 2.3522]) // Paris default
  const [zoom, setZoom] = useState(6)
  const [shouldUpdateMap, setShouldUpdateMap] = useState(true) // Contrôle si on doit mettre à jour la carte
  const userHasInteracted = useRef(false) // Suivre si l'utilisateur a interagi avec la carte

  // Charger les données initiales
  useEffect(() => {
    loadInitialData()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Mettre à jour selectedSurveyId si l'ID dans l'URL change
  useEffect(() => {
    if (id && id !== selectedSurveyId) {
      setSelectedSurveyId(id)
    }
  }, [id])

  // Recharger les données quand les filtres changent
  useEffect(() => {
    loadData()
    
    // Mise à jour en temps réel
    if (realtimeEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval(() => {
        loadData()
      }, 10000) // Mise à jour toutes les 10 secondes
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [selectedSurveyId, selectedAgentId, periodType, customStartDate, customEndDate, realtimeEnabled, id])

  const loadInitialData = async () => {
    try {
      const [surveysRes, agentsRes] = await Promise.all([
        surveyService.getSurveys(),
        authService.getAgents()
      ])
      
      setSurveys(surveysRes.data || [])
      setAgents(agentsRes.data || [])
      
      if (id) {
        const surveyRes = await surveyService.getSurvey(id)
        setSurvey(surveyRes.data)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    let startDate: Date | null = null
    let endDate: Date | null = null

    switch (periodType) {
      case 'day':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        endDate = new Date(now)
        break
      case 'month':
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        endDate = new Date(now)
        break
      case 'custom':
        if (customStartDate) startDate = new Date(customStartDate)
        if (customEndDate) {
          endDate = new Date(customEndDate)
          endDate.setHours(23, 59, 59, 999)
        }
        break
    }

    return {
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const { startDate, endDate } = getDateRange()
      
      logger.log('📍 MapView loadData - Filters:', {
        selectedSurveyId,
        selectedAgentId,
        periodType,
        startDate,
        endDate,
        customStartDate,
        customEndDate,
        id,
        isFixedSurvey
      })
      
      let responsesRes
      
      // Si on a un ID fixe dans l'URL, toujours l'utiliser
      const surveyIdToUse = isFixedSurvey && id ? id : selectedSurveyId
      
      if (surveyIdToUse) {
        // Charger pour un sondage spécifique
        responsesRes = await responseService.getMapResponses(surveyIdToUse, {
          agentId: selectedAgentId || undefined,
          startDate,
          endDate
        })
        
        // Charger les infos du sondage si pas déjà chargé
        if (!survey || survey.id !== surveyIdToUse) {
          try {
            const surveyRes = await surveyService.getSurvey(surveyIdToUse)
            setSurvey(surveyRes.data)
          } catch (surveyError) {
            console.error('Error loading survey:', surveyError)
          }
        }
      } else {
        // Charger toutes les réponses
        responsesRes = await responseService.getMapResponsesAll({
          surveyId: undefined,
          agentId: selectedAgentId || undefined,
          startDate,
          endDate
        })
        setSurvey(null)
      }
      
      const data = responsesRes?.data || []
      setResponses(data)
      
      // Centrer la carte sur les réponses seulement si l'utilisateur n'a pas interagi
      if (data.length > 0 && data[0].coordinates && !userHasInteracted.current) {
        setCenter([data[0].coordinates[1], data[0].coordinates[0]])
        setZoom(10)
        setShouldUpdateMap(true)
      } else {
        // Si l'utilisateur a interagi, ne pas forcer la mise à jour
        setShouldUpdateMap(false)
      }
    } catch (error: any) {
      logger.error('Error loading map data:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des données de la carte'
      // Afficher l'erreur à l'utilisateur (vous pouvez ajouter un état pour afficher un message d'erreur visible)
      alert(`⚠️ ${errorMessage}`)
      setResponses([]) // S'assurer que responses est un tableau vide en cas d'erreur
    } finally {
      setLoading(false)
    }
  }

  const filteredResponses = responses.filter(response => {
    if (filter === 'all') return true
    if (!response.npsScore) return false
    
    if (filter === 'promoters') return response.npsScore >= 9
    if (filter === 'passives') return response.npsScore >= 7 && response.npsScore < 9
    if (filter === 'detractors') return response.npsScore < 7
    return true
  })

  if (loading && responses.length === 0) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header avec filtres */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Bouton retour si on vient d'un sondage spécifique */}
            {isFixedSurvey && id && (
              <button
                onClick={() => navigate(`/surveys/${id}`, { replace: false })}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Retour au sondage"
              >
                <span className="text-lg">←</span>
                <span>Retour</span>
              </button>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {survey ? survey.title : 'Vue Cartographique'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredResponses.length} réponses géolocalisées affichées
              </p>
            </div>
          </div>
          
          {/* Toggle temps réel */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={realtimeEnabled}
                onChange={(e) => setRealtimeEnabled(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {realtimeEnabled ? '🟢 Temps réel activé' : '⚪ Temps réel désactivé'}
              </span>
            </label>
          </div>
        </div>

        {/* Filtres */}
        <div className={`grid grid-cols-1 gap-4 ${isFixedSurvey ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
          {/* Sondage - caché si on vient d'un sondage spécifique */}
          {!isFixedSurvey && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sondage
              </label>
              <SelectWithScroll
                value={selectedSurveyId}
                onChange={setSelectedSurveyId}
                options={surveys}
                placeholder="Tous les sondages"
                renderOption={(survey) => survey.title}
              />
            </div>
          )}

          {/* Agent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agent
            </label>
            <SelectWithScroll
              value={selectedAgentId}
              onChange={setSelectedAgentId}
              options={agents}
              placeholder="Tous les agents"
              renderOption={(agent) => `${agent.firstName} ${agent.lastName}`}
            />
          </div>

          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Période
            </label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Toutes les périodes</option>
              <option value="day">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="custom">Période personnalisée</option>
            </select>
          </div>

          {/* Type de carte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de carte
            </label>
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as MapType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {Object.entries(MAP_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Période personnalisée */}
        {periodType === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
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

        {/* Filtres NPS */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Tous ({responses.length})
          </button>
          <button
            onClick={() => setFilter('promoters')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              filter === 'promoters'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            🟢 Promoteurs ({responses.filter(r => r.npsScore >= 9).length})
          </button>
          <button
            onClick={() => setFilter('passives')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              filter === 'passives'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            🟡 Passifs ({responses.filter(r => r.npsScore >= 7 && r.npsScore < 9).length})
          </button>
          <button
            onClick={() => setFilter('detractors')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              filter === 'detractors'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            🔴 Détracteurs ({responses.filter(r => r.npsScore < 7).length})
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {filteredResponses.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">Aucune donnée géolocalisée</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isFixedSurvey && survey 
                  ? `Aucune réponse géolocalisée pour "${survey.title}"`
                  : 'Ajustez les filtres pour voir les réponses'}
              </p>
              {isFixedSurvey && id && (
                <button
                  onClick={() => navigate(`/surveys/${id}`, { replace: false })}
                  className="btn btn-secondary"
                >
                  ← Retour au sondage
                </button>
              )}
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
            whenCreated={(mapInstance) => {
              // Détecter les interactions utilisateur (zoom, pan)
              mapInstance.on('zoomend', () => {
                const currentZoom = mapInstance.getZoom()
                setZoom(currentZoom)
                userHasInteracted.current = true
                setShouldUpdateMap(false)
              })
              mapInstance.on('moveend', () => {
                const currentCenter = mapInstance.getCenter()
                setCenter([currentCenter.lat, currentCenter.lng])
                userHasInteracted.current = true
                setShouldUpdateMap(false)
              })
            }}
          >
            <MapUpdater center={center} zoom={zoom} shouldUpdate={shouldUpdateMap} />
            <TileLayer
              attribution={MAP_TYPES[mapType].attribution}
              url={MAP_TYPES[mapType].url}
            />
            <LabelsOverlay mapType={mapType} />
            
            {filteredResponses.map((response) => (
              <Marker
                key={response.id}
                position={[response.coordinates[1], response.coordinates[0]]}
                icon={createMarkerIcon(response.npsScore)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold mb-2">
                      {response.respondent 
                        ? `${response.respondent.firstName} ${response.respondent.lastName}`
                        : 'Réponse anonyme'}
                    </h3>
                    
                    {response.survey && (
                      <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                        <strong>Sondage:</strong> {response.survey.title}
                      </div>
                    )}
                    
                    {response.npsScore !== undefined && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">NPS: </span>
                        <span className={`font-bold ${
                          response.npsScore >= 9 ? 'text-green-600' :
                          response.npsScore >= 7 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {response.npsScore}/10
                        </span>
                      </div>
                    )}
                    
                    {response.csatScore !== undefined && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">CSAT: </span>
                        <span className="font-bold text-yellow-600">
                          {'⭐'.repeat(Math.round(response.csatScore))}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {new Date(response.submittedAt).toLocaleString('fr-FR')}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      Lat: {response.coordinates[1].toFixed(6)}, 
                      Lon: {response.coordinates[0].toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Stats Panel */}
      <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {responses.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {responses.filter(r => r.npsScore >= 9).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Promoteurs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {responses.filter(r => r.npsScore >= 7 && r.npsScore < 9).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Passifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {responses.filter(r => r.npsScore < 7).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Détracteurs</div>
          </div>
        </div>
      </div>
    </div>
  )
}
