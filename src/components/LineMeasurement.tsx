import { useState, useEffect } from 'react'

interface Point {
  latitude: number
  longitude: number
  order: number
}

interface MeasuredLine {
  id: string
  name: string
  points: Point[]
  distance: number // en mètres
  timestamp: Date
}

interface LineMeasurementProps {
  value: MeasuredLine[]
  onChange: (lines: MeasuredLine[]) => void
  required?: boolean
}

export default function LineMeasurement({ value = [], onChange, required }: LineMeasurementProps) {
  const [lines, setLines] = useState<MeasuredLine[]>(value)
  const [currentLine, setCurrentLine] = useState<{ name: string; points: Point[] } | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState('')
  const [newLineName, setNewLineName] = useState('')

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

  // Calculer la distance totale d'une ligne
  const calculateTotalDistance = (points: Point[]): number => {
    if (points.length < 2) return 0

    let totalDistance = 0
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += calculateDistance(
        points[i].latitude,
        points[i].longitude,
        points[i + 1].latitude,
        points[i + 1].longitude
      )
    }

    return totalDistance
  }

  const startNewLine = () => {
    if (!newLineName.trim()) {
      setError('Veuillez entrer un nom pour cette ligne')
      return
    }

    setCurrentLine({
      name: newLineName.trim(),
      points: []
    })
    setNewLineName('')
    setError('')
  }

  const addPointToCurrentLine = () => {
    if (!currentLine) {
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
            order: currentLine.points.length + 1
          }

          setCurrentLine({
            ...currentLine,
            points: [...currentLine.points, newPoint]
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

  const finishCurrentLine = () => {
    if (!currentLine) return

    if (currentLine.points.length < 2) {
      setError('Une ligne doit avoir au moins 2 points')
      return
    }

    const distance = calculateTotalDistance(currentLine.points)

    const newLine: MeasuredLine = {
      id: `line_${Date.now()}`,
      name: currentLine.name,
      points: currentLine.points,
      distance: distance,
      timestamp: new Date()
    }

    const updatedLines = [...lines, newLine]
    setLines(updatedLines)
    onChange(updatedLines)
    setCurrentLine(null)
    setError('')
  }

  const cancelCurrentLine = () => {
    setCurrentLine(null)
    setError('')
  }

  const removeLastPoint = () => {
    if (!currentLine || currentLine.points.length === 0) return

    setCurrentLine({
      ...currentLine,
      points: currentLine.points.slice(0, -1)
    })
  }

  const removeLine = (id: string) => {
    const updatedLines = lines.filter(l => l.id !== id)
    setLines(updatedLines)
    onChange(updatedLines)
  }

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`
    }
    return `${meters.toFixed(2)} m`
  }

  const openInMaps = (points: Point[]) => {
    if (points.length === 0) return
    
    // Créer une URL Google Maps avec le premier point
    const firstPoint = points[0]
    const url = `https://www.google.com/maps?q=${firstPoint.latitude},${firstPoint.longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Current Location */}
      {currentLocation && !currentLine && (
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

      {/* Start New Line */}
      {!currentLine && (
        <div className="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span className="text-xl">📏</span>
            Nouvelle mesure de distance
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nom de la ligne {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={newLineName}
                onChange={(e) => setNewLineName(e.target.value)}
                placeholder="Ex: Cours d'eau principal, Route nationale, Sentier..."
                className="input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    startNewLine()
                  }
                }}
              />
            </div>

            <button
              onClick={startNewLine}
              disabled={!newLineName.trim()}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              <span>📏</span>
              <span>Commencer la mesure</span>
            </button>

            {error && !currentLine && (
              <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Line Being Measured */}
      {currentLine && (
        <div className="border-2 border-primary-500 dark:border-primary-600 rounded-lg p-4 bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <span className="text-xl">📏</span>
              {currentLine.name}
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
              <li>Déplacez-vous au point de départ</li>
              <li>Marquez le point</li>
              <li>Suivez la ligne (cours d'eau, route...)</li>
              <li>Marquez des points régulièrement le long du tracé</li>
              <li>Terminez au point d'arrivée (min. 2 points)</li>
            </ol>
          </div>

          {/* Points List */}
          {currentLine.points.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded mb-3">
              <p className="font-medium text-sm mb-2">
                Points marqués : {currentLine.points.length}
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {currentLine.points.map((point, idx) => (
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

              {currentLine.points.length >= 2 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    📏 Distance : {formatDistance(calculateTotalDistance(currentLine.points))}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={addPointToCurrentLine}
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

            {currentLine.points.length > 0 && (
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
              onClick={finishCurrentLine}
              disabled={currentLine.points.length < 2}
              className="btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <span>✓</span>
              <span>Terminer ({currentLine.points.length} pts)</span>
            </button>

            <button
              onClick={cancelCurrentLine}
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

      {/* Measured Lines List */}
      {lines.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <span>📊</span>
            Distances mesurées ({lines.length})
          </h4>
          
          <div className="space-y-3">
            {lines.map((line, index) => (
              <div
                key={line.id}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-2">
                      {line.name}
                    </h5>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Distance totale</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatDistance(line.distance)}
                      </p>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <p>Points : {line.points.length}</p>
                      <p>{new Date(line.timestamp).toLocaleString('fr-FR')}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openInMaps(line.points)}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        🗺️ Voir tracé
                      </button>
                      <button
                        onClick={() => removeLine(line.id)}
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
              <span className="font-bold text-lg">📊 Distance totale</span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatDistance(lines.reduce((sum, line) => sum + line.distance, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {lines.length === 0 && !currentLine && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
          <p className="text-3xl mb-2">📏</p>
          <p className="mb-2 font-medium">Aucune distance mesurée</p>
          <p className="text-xs">
            Commencez par entrer un nom puis suivez le tracé en marquant des points réguliers
          </p>
        </div>
      )}
    </div>
  )
}



