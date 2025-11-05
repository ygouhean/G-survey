import { useState, useRef, useEffect } from 'react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
  maxSizeMB?: number
}

export default function CameraCapture({ onCapture, onClose, maxSizeMB = 10 }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err: any) {
      console.error('Erreur caméra:', err)
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Définir les dimensions du canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dessiner l'image sur le canvas
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convertir en blob puis en fichier
      canvas.toBlob((blob) => {
        if (blob) {
          const sizeMB = blob.size / 1024 / 1024
          if (sizeMB > maxSizeMB) {
            setError(`La photo est trop volumineuse (${sizeMB.toFixed(2)} MB). Taille max : ${maxSizeMB} MB`)
            return
          }

          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
          stopCamera()
          onCapture(file)
        }
      }, 'image/jpeg', 0.9)
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                stopCamera()
                onClose()
              }}
              className="text-white text-2xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-white font-semibold">Prendre une photo</h3>
            <button
              onClick={switchCamera}
              className="text-white text-2xl"
              title="Changer de caméra"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Video Preview */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-full"
          />
        </div>

        {/* Canvas caché pour la capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Error Message */}
        {error && (
          <div className="absolute top-20 left-4 right-4 bg-red-500 text-white p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
          <div className="flex justify-center items-center">
            <button
              onClick={capturePhoto}
              disabled={!stream || !!error}
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:border-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-full h-full rounded-full bg-white"></div>
            </button>
          </div>
          <p className="text-white text-center mt-4 text-sm">
            Appuyez sur le bouton pour capturer
          </p>
        </div>
      </div>
    </div>
  )
}








