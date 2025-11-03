import { useState, useEffect } from 'react'

interface Point {
  latitude: number
  longitude: number
  order: number
}

interface MeasuredArea {
  id: string
  name: string
  points: Point[]
  area: number // en m²
  perimeter: number // en mètres
  timestamp: Date
}

interface AreaMeasurementProps {
  value: MeasuredArea[]
  onChange: (areas: MeasuredArea[]) => void
  required?: boolean
}

export default function AreaMeasurement({ value = [], onChange, required }: AreaMeasurementProps) {
  const [areas, setAreas] = useState<MeasuredArea[]>(value)
  const [currentArea, setCurrentArea] = useState<{ name: string; points: Point[] } | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState('')
  const [newAreaName, setNewAreaName] = useState('')

  useEffect(() => {
    // Obtenir la position initiale et mettre à jour régulièrement
    const updatePosition = () => {
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
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000
          }
        )
      }
    }

    updatePosition()
    const interval = setInterval(updatePosition, 10000) // Mise à jour toutes les 10s

    return () => clearInterval(interval)
  }, [])

  // Calculer la distance entre deux points GPS (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000 // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calculer la superficie d'un polygone (formule de Shoelace adaptée pour coordonnées GPS)
  const calculateArea = (points: Point[]): number => {
    if (points.length < 3) return 0

    // Convertir les coordonnées en projection métrique locale
    const centerLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length
    const centerLon = points.reduce((sum, p) => sum + p.longitude, 0) / points.length

    const R = 6371000 // Rayon de la Terre en mètres

    // Convertir chaque point en coordonnées cartésiennes locales (en mètres)
    const cartesianPoints = points.map(p => {
      const x = (p.longitude - centerLon) * Math.PI / 180 * R * Math.cos(centerLat * Math.PI / 180)
      const y = (p.latitude - centerLat) * Math.PI / 180 * R
      return { x, y }
    })

    // Appliquer la formule de Shoelace
    let area = 0
    for (let i = 0; i < cartesianPoints.length; i++) {
      const j = (i + 1) % cartesianPoints.length
      area += cartesianPoints[i].x * cartesianPoints[j].y
      area -= cartesianPoints[j].x * cartesianPoints[i].y
    }

    return Math.abs(area / 2)
  }

  // Calculer le périmètre
  const calculatePerimeter = (points: Point[]): number => {
    if (points.length < 2) return 0

    let perimeter = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      perimeter += calculateDistance(
        points[i].latitude,
        points[i].longitude,
        points[j].latitude,
        points[j].longitude
      )
    }

    return perimeter
  }

  const startNewArea = () => {
    if (!newAreaName.trim()) {
      setError('Veuillez entrer un nom pour cette zone')
      return
    }

    setCurrentArea({
      name: newAreaName.trim(),
      points: []
    })
    setNewAreaName('')
    setError('')
  }

  const addPointToCurrentArea = () => {
    if (!currentArea) {
      setError('Commencez d\'abord une nouvelle mesure')
      return
    }

    setIsCapturing(true)
    setError('')

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPoint: Point = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            order: currentArea.points.length + 1
          }

          setCurrentArea({
            ...currentArea,
            points: [...currentArea.points, newPoint]
          })
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

  const finishCurrentArea = () => {
    if (!currentArea) return

    if (currentArea.points.length < 3) {
      setError('Une zone doit avoir au moins 3 points')
      return
    }

    const area = calculateArea(currentArea.points)
    const perimeter = calculatePerimeter(currentArea.points)

    const newArea: MeasuredArea = {
      id: `area_${Date.now()}`,
      name: currentArea.name,
      points: currentArea.points,
      area: area,
      perimeter: perimeter,
      timestamp: new Date()
    }

    const updatedAreas = [...areas, newArea]
    setAreas(updatedAreas)
    onChange(updatedAreas)
    setCurrentArea(null)
    setError('')
  }

  const cancelCurrentArea = () => {
    setCurrentArea(null)
    setError('')
  }

  const removeLastPoint = () => {
    if (!currentArea || currentArea.points.length === 0) return

    setCurrentArea({
      ...currentArea,
      points: currentArea.points.slice(0, -1)
    })
  }

  const removeArea = (id: string) => {
    const updatedAreas = areas.filter(a => a.id !== id)
    setAreas(updatedAreas)
    onChange(updatedAreas)
  }

  const formatArea = (areaM2: number): string => {
    if (areaM2 >= 10000) {
      return `${(areaM2 / 10000).toFixed(2)} ha`
    }
    return `${areaM2.toFixed(2)} m²`
  }

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`
    }
    return `${meters.toFixed(2)} m`
  }

  const openInMaps = (points: Point[]) => {
    if (points.length === 0) return
    
    // Ouvrir Google Maps avec le premier point (on pourrait améliorer pour afficher le polygone)
    const center = points[0]
    const url = `https://www.google.com/maps?q=${center.latitude},${center.longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Current Location */}
      {currentLocation && !currentArea && (
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

      {/* Start New Area */}
      {!currentArea && (
        <div className="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span className="text-xl">📐</span>
            Nouvelle mesure de superficie
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nom de la zone {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="Ex: Plantation de cacaoyers A, Champ d'hévéas..."
                className="input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    startNewArea()
                  }
                }}
              />
            </div>

            <button
              onClick={startNewArea}
              disabled={!newAreaName.trim()}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              <span>📐</span>
              <span>Commencer la mesure</span>
            </button>

            {error && !currentArea && (
              <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Area Being Measured */}
      {currentArea && (
        <div className="border-2 border-primary-500 dark:border-primary-600 rounded-lg p-4 bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <span className="text-xl">📐</span>
              {currentArea.name}
            </h4>
            <span className="text-sm px-2 py-1 bg-primary-600 text-white rounded-full">
              En cours
            </span>
          </div>

          {/* Current Position */}
          {currentLocation && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded mb-3 text-sm">
              <p className="font-medium mb-1">📍 Position actuelle</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded mb-3 text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              📋 Instructions
            </p>
            <ol className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
              <li>Déplacez-vous au 1er coin de la zone</li>
              <li>Marquez le point</li>
              <li>Déplacez-vous au coin suivant</li>
              <li>Répétez pour tous les coins (min. 3 points)</li>
              <li>Terminez la mesure</li>
            </ol>
          </div>

          {/* Points List */}
          {currentArea.points.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded mb-3">
              <p className="font-medium text-sm mb-2">
                Points marqués : {currentArea.points.length}
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {currentArea.points.map((point, idx) => (
                  <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {point.order}
                    </span>
                    <span className="font-mono text-xs">
                      {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                    </span>
                  </div>
                ))}
              </div>

              {currentArea.points.length >= 3 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    📏 Superficie estimée : {formatArea(calculateArea(currentArea.points))}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Périmètre : {formatDistance(calculatePerimeter(currentArea.points))}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={addPointToCurrentArea}
              disabled={isCapturing}
              className="btn btn-primary disabled:opacity-50"
            >
              {isCapturing ? (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>Capture...</span>
                </>
              ) : (
                <>
                  <span>📍</span>
                  <span>Marquer un point</span>
                </>
              )}
            </button>

            {currentArea.points.length > 0 && (
              <button
                onClick={removeLastPoint}
                className="btn bg-orange-500 hover:bg-orange-600 text-white"
              >
                <span>↩️</span>
                <span>Retirer dernier</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={finishCurrentArea}
              disabled={currentArea.points.length < 3}
              className="btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <span>✓</span>
              <span>Terminer ({currentArea.points.length} pts)</span>
            </button>

            <button
              onClick={cancelCurrentArea}
              className="btn bg-red-500 hover:bg-red-600 text-white"
            >
              <span>✗</span>
              <span>Annuler</span>
            </button>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Measured Areas List */}
      {areas.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <span>📊</span>
            Superficies mesurées ({areas.length})
          </h4>
          
          <div className="space-y-3">
            {areas.map((area, index) => (
              <div
                key={area.id}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-700"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-lg text-green-900 dark:text-green-100 mb-2">
                      {area.name}
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white dark:bg-gray-800 p-2 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Superficie</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatArea(area.area)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-2 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Périmètre</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {formatDistance(area.perimeter)}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <p>Points : {area.points.length}</p>
                      <p>{new Date(area.timestamp).toLocaleString('fr-FR')}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openInMaps(area.points)}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        🗺️ Voir zone
                      </button>
                      <button
                        onClick={() => removeArea(area.id)}
                        className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-lg border-2 border-primary-300 dark:border-primary-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">📊 Total</span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatArea(areas.reduce((sum, area) => sum + area.area, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {areas.length === 0 && !currentArea && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
          <p className="text-3xl mb-2">📐</p>
          <p className="mb-2 font-medium">Aucune superficie mesurée</p>
          <p className="text-xs">
            Commencez par entrer un nom de zone puis marquez les coins de la surface à mesurer
          </p>
        </div>
      )}
    </div>
  )
}




