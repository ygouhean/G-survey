import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import L from 'leaflet'
import responseService from '../services/responseService'
import surveyService from '../services/surveyService'
import LoadingSpinner from '../components/LoadingSpinner'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-markercluster/dist/styles.min.css'

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function MapView() {
  const { id } = useParams()
  const [survey, setSurvey] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'promoters' | 'passives' | 'detractors'>('all')
  const [center, setCenter] = useState<[number, number]>([48.8566, 2.3522]) // Paris default
  const [zoom, setZoom] = useState(6)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      if (id) {
        const [surveyRes, responsesRes] = await Promise.all([
          surveyService.getSurvey(id),
          responseService.getMapResponses(id)
        ])
        setSurvey(surveyRes.data)
        setResponses(responsesRes.data)
        
        // Center map on first response
        if (responsesRes.data.length > 0 && responsesRes.data[0].coordinates) {
          setCenter([responsesRes.data[0].coordinates[1], responsesRes.data[0].coordinates[0]])
          setZoom(10)
        }
      } else {
        // Load all responses from all surveys
        const responsesRes = await responseService.getResponses({ 
          hasLocation: true 
        })
        setResponses(responsesRes.data.filter((r: any) => r.location))
      }
    } catch (error) {
      console.error('Error loading map data:', error)
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

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {survey ? survey.title : 'Vue Cartographique'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredResponses.length} réponses géolocalisées
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Tous ({responses.length})
            </button>
            <button
              onClick={() => setFilter('promoters')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'promoters'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              🟢 Promoteurs ({responses.filter(r => r.npsScore >= 9).length})
            </button>
            <button
              onClick={() => setFilter('passives')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'passives'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              🟡 Passifs ({responses.filter(r => r.npsScore >= 7 && r.npsScore < 9).length})
            </button>
            <button
              onClick={() => setFilter('detractors')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'detractors'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              🔴 Détracteurs ({responses.filter(r => r.npsScore < 7).length})
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Promoteurs (NPS 9-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Passifs (NPS 7-8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Détracteurs (NPS 0-6)</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {filteredResponses.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">Aucune donnée géolocalisée</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Les réponses avec géolocalisation apparaîtront ici
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
          >
            <MapUpdater center={center} zoom={zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MarkerClusterGroup>
              {filteredResponses.map((response) => (
                <Marker
                  key={response.id}
                  position={[response.coordinates[1], response.coordinates[0]]}
                  icon={createMarkerIcon(response.npsScore)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold mb-2">
                        {response.respondent 
                          ? `${response.respondent.firstName} ${response.respondent.lastName}`
                          : 'Réponse anonyme'}
                      </h3>
                      
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
                      
                      <div className="text-xs text-gray-600 mt-2">
                        {new Date(response.submittedAt).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
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
