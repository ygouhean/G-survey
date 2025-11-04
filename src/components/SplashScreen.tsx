import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Masquer le splash screen après 3 secondes
    const timer = setTimeout(() => {
      setVisible(false)
      // Attendre la fin de l'animation de sortie avant d'appeler onComplete
      setTimeout(() => {
        onComplete()
      }, 300) // 300ms pour l'animation de sortie
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) {
    return null
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Logo et texte */}
      <div className="text-center space-y-4 animate-fade-in px-4">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/images/logolight.png" 
            alt="G-Survey Logo" 
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover shadow-2xl animate-pulse-slow" 
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 animate-slide-up">
          G-Survey
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-100 font-medium animate-slide-up-delay max-w-2xl mx-auto">
          La plateforme de sondages géolocalisés pour professionnels
        </p>
      </div>
    </div>
  )
}

