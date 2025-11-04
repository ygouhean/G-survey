import { useState, useRef, useEffect } from 'react'

interface VideoCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
  maxSizeMB?: number
}

export default function VideoCapture({ onCapture, onClose, maxSizeMB = 10 }: VideoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string>('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const startCamera = async () => {
    try {
      setError('')
      
      // Vérifier si l'API est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('L\'accès à la caméra n\'est pas disponible sur cet appareil')
      }
      
      // Configuration vidéo adaptée selon l'appareil
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      const videoConstraints: any = {
        facingMode: facingMode,
        width: { ideal: isIOS ? 1280 : 1920 },
        height: { ideal: isIOS ? 720 : 1080 }
      }
      
      // Pour iOS, ne pas spécifier facingMode si on est sur Mac
      if (isIOS && navigator.platform === 'MacIntel') {
        delete videoConstraints.facingMode
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      // Préparer le MediaRecorder avec détection du meilleur format pour le navigateur
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      
      let mimeType = 'video/webm'
      let fileExtension = 'webm'
      
      // Détecter le meilleur format supporté
      const possibleTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
        'video/quicktime'
      ]
      
      // Pour iOS/Safari, préférer QuickTime
      if (isIOS || isSafari) {
        if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4'
          fileExtension = 'mp4'
        } else if (MediaRecorder.isTypeSupported('video/quicktime')) {
          mimeType = 'video/quicktime'
          fileExtension = 'mov'
        }
      } else {
        // Pour les autres navigateurs, essayer webm puis mp4
        for (const type of possibleTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type
            if (type.includes('mp4')) {
              fileExtension = 'mp4'
            }
            break
          }
        }
      }
      
      const options = { mimeType }
      // Log seulement en développement
      if (import.meta.env.DEV) {
        console.log('📹 Format vidéo sélectionné:', mimeType, 'pour', navigator.userAgent)
      }
      
      mediaRecorderRef.current = new MediaRecorder(mediaStream, options)
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const sizeMB = blob.size / 1024 / 1024
        
        if (sizeMB > maxSizeMB) {
          setError(`La vidéo est trop volumineuse (${sizeMB.toFixed(2)} MB). Taille max : ${maxSizeMB} MB`)
          chunksRef.current = []
          return
        }

        const file = new File([blob], `video_${Date.now()}.${fileExtension}`, { type: mimeType })
        stopCamera()
        onCapture(file)
      }
    } catch (err: any) {
      console.error('Erreur caméra:', err)
      setError('Impossible d\'accéder à la caméra/microphone. Vérifiez les permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      chunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const switchCamera = () => {
    if (!isRecording) {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (isRecording) {
                  stopRecording()
                }
                stopCamera()
                onClose()
              }}
              className="text-white text-2xl font-bold"
              disabled={isRecording}
            >
              ✕
            </button>
            <div className="flex flex-col items-center">
              <h3 className="text-white font-semibold">Enregistrer une vidéo</h3>
              {isRecording && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-mono">{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
            <button
              onClick={switchCamera}
              className="text-white text-2xl"
              title="Changer de caméra"
              disabled={isRecording}
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
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-20 left-4 right-4 bg-red-500 text-white p-3 rounded-lg">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
          <div className="flex justify-center items-center">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={!stream || !!error}
                className="w-20 h-20 rounded-full bg-red-500 border-4 border-white hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <div className="text-white text-3xl">●</div>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-500 border-4 border-white hover:bg-red-600 transition-all flex items-center justify-center"
              >
                <div className="w-8 h-8 bg-white rounded"></div>
              </button>
            )}
          </div>
          <p className="text-white text-center mt-4 text-sm">
            {!isRecording 
              ? 'Appuyez pour commencer l\'enregistrement' 
              : 'Appuyez pour arrêter l\'enregistrement'}
          </p>
          <p className="text-white text-center mt-1 text-xs opacity-70">
            Taille max : {maxSizeMB} MB
          </p>
        </div>
      </div>
    </div>
  )
}






