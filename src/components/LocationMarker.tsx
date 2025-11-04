import { useState, useEffect } from 'react'

interface LocationPoint {
  id: string
  name: string
  latitude: number
  longitude: number
  timestamp: Date
}

interface LocationMarkerProps {
  value: LocationPoint[]
  onChange: (points: LocationPoint[]) => void
  required?: boolean
}

export default function LocationMarker({ value = [], onChange, required }: LocationMarkerProps) {
  const [points, setPoints] = useState<LocationPoint[]>(value)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [newPointName, setNewPointName] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Obtenir la position initiale
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (err) => {
          console.error('Erreur géolocalisation:', err)
        }
      )
    }
  }, [])

  const captureCurrentLocation = () => {
    if (!newPointName.trim()) {
      setError('Veuillez entrer un nom pour ce point')
      return
    }

    setIsCapturing(true)
    setError('')

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPoint: LocationPoint = {
            id: `point_${Date.now()}`,
            name: newPointName.trim(),
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date()
          }

          const updatedPoints = [...points, newPoint]
          setPoints(updatedPoints)
          onChange(updatedPoints)
          setNewPointName('')
          setIsCapturing(false)
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (err) => {
          console.error('Erreur capture position:', err)
          setError('Impossible de capturer la position. Vérifiez les permissions.')
          setIsCapturing(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setError('Votre navigateur ne supporte pas la géolocalisation')
      setIsCapturing(false)
    }
  }

  const removePoint = (id: string) => {
    const updatedPoints = points.filter(p => p.id !== id)
    setPoints(updatedPoints)
    onChange(updatedPoints)
  }

  const updatePointName = (id: string, newName: string) => {
    const updatedPoints = points.map(p =>
      p.id === id ? { ...p, name: newName } : p
    )
    setPoints(updatedPoints)
    onChange(updatedPoints)
  }

  const openInMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Current Location Display */}
      {currentLocation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">📍</span>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Position actuelle</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add New Point */}
      <div className="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <span className="text-xl">📍</span>
          Marquer un nouveau point
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom du point {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={newPointName}
              onChange={(e) => setNewPointName(e.target.value)}
              placeholder="Ex: Centre de santé A, École communale..."
              className="input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  captureCurrentLocation()
                }
              }}
            />
          </div>

          <button
            onClick={captureCurrentLocation}
            disabled={isCapturing || !newPointName.trim()}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {isCapturing ? (
              <>
                <span className="animate-spin">⟳</span>
                <span>Capture en cours...</span>
              </>
            ) : (
              <>
                <span>📍</span>
                <span>Marquer ma position actuelle</span>
              </>
            )}
          </button>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Points List */}
      {points.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <span>📌</span>
            Points marqués ({points.length})
          </h4>
          
          <div className="space-y-2">
            {points.map((point, index) => (
              <div
                key={point.id}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={point.name}
                      onChange={(e) => updatePointName(point.id, e.target.value)}
                      className="input mb-2"
                    />
                    
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">Lat: {point.latitude.toFixed(6)}</span>
                        <span className="font-mono">Lng: {point.longitude.toFixed(6)}</span>
                      </div>
                      <div>
                        {new Date(point.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openInMaps(point.latitude, point.longitude)}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        🗺️ Voir sur la carte
                      </button>
                      <button
                        onClick={() => removePoint(point.id)}
                        className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {points.length === 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          <p className="mb-2">🗺️ Aucun point marqué pour le moment</p>
          <p>Déplacez-vous jusqu'au point d'intérêt et marquez votre position</p>
        </div>
      )}
    </div>
  )
}







