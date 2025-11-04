import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Masquer le splash screen après 5 secondes
    const timer = setTimeout(() => {
      setVisible(false)
      // Attendre la fin de l'animation de sortie avant d'appeler onComplete
      setTimeout(() => {
        onComplete()
      }, 500) // 500ms pour l'animation de sortie
    }, 5000)

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
      {/* Animation 3D du drone */}
      <div className="drone-container mb-6 sm:mb-8">
        <div className="drone">
          {/* Corps du drone */}
          <div className="drone-body">
            <div className="drone-center"></div>
            {/* Bras du drone */}
            <div className="drone-arm arm-1"></div>
            <div className="drone-arm arm-2"></div>
            <div className="drone-arm arm-3"></div>
            <div className="drone-arm arm-4"></div>
            {/* Hélices */}
            <div className="propeller prop-1">
              <div className="propeller-blade blade-1"></div>
              <div className="propeller-blade blade-2"></div>
              <div className="propeller-blade blade-3"></div>
              <div className="propeller-blade blade-4"></div>
            </div>
            <div className="propeller prop-2">
              <div className="propeller-blade blade-1"></div>
              <div className="propeller-blade blade-2"></div>
              <div className="propeller-blade blade-3"></div>
              <div className="propeller-blade blade-4"></div>
            </div>
            <div className="propeller prop-3">
              <div className="propeller-blade blade-1"></div>
              <div className="propeller-blade blade-2"></div>
              <div className="propeller-blade blade-3"></div>
              <div className="propeller-blade blade-4"></div>
            </div>
            <div className="propeller prop-4">
              <div className="propeller-blade blade-1"></div>
              <div className="propeller-blade blade-2"></div>
              <div className="propeller-blade blade-3"></div>
              <div className="propeller-blade blade-4"></div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Styles CSS pour l'animation 3D */}
      <style>{`
        .drone-container {
          perspective: 1000px;
          perspective-origin: center center;
        }

        .drone {
          width: 150px;
          height: 150px;
          position: relative;
          transform-style: preserve-3d;
          animation: drone-fly 4s ease-in-out infinite;
        }

        @media (min-width: 640px) {
          .drone {
            width: 200px;
            height: 200px;
          }
        }

        @keyframes drone-fly {
          0%, 100% {
            transform: translateY(0) translateX(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          15% {
            transform: translateY(-25px) translateX(5px) rotateX(8deg) rotateY(5deg) rotateZ(2deg);
          }
          30% {
            transform: translateY(-15px) translateX(-5px) rotateX(0deg) rotateY(-8deg) rotateZ(-2deg);
          }
          45% {
            transform: translateY(-20px) translateX(3px) rotateX(-5deg) rotateY(3deg) rotateZ(1deg);
          }
          60% {
            transform: translateY(-10px) translateX(-3px) rotateX(5deg) rotateY(-5deg) rotateZ(-1deg);
          }
          75% {
            transform: translateY(-18px) translateX(2px) rotateX(-3deg) rotateY(6deg) rotateZ(1.5deg);
          }
          90% {
            transform: translateY(-12px) translateX(-2px) rotateX(3deg) rotateY(-3deg) rotateZ(-1deg);
          }
        }

        .drone-body {
          width: 60px;
          height: 60px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.2);
          transform-style: preserve-3d;
        }

        @media (min-width: 640px) {
          .drone-body {
            width: 80px;
            height: 80px;
          }
        }

        .drone-center {
          width: 30px;
          height: 30px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.4);
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        @media (min-width: 640px) {
          .drone-center {
            width: 40px;
            height: 40px;
          }
        }

        .drone-arm {
          position: absolute;
          width: 3px;
          height: 45px;
          background: linear-gradient(to bottom, #667eea, #764ba2);
          border-radius: 2px;
          top: 50%;
          left: 50%;
          transform-origin: top center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        @media (min-width: 640px) {
          .drone-arm {
            width: 4px;
            height: 60px;
          }
        }

        .arm-1 {
          transform: translate(-50%, -50%) rotate(45deg) translateY(-22px);
        }

        .arm-2 {
          transform: translate(-50%, -50%) rotate(135deg) translateY(-22px);
        }

        .arm-3 {
          transform: translate(-50%, -50%) rotate(225deg) translateY(-22px);
        }

        .arm-4 {
          transform: translate(-50%, -50%) rotate(315deg) translateY(-22px);
        }

        @media (min-width: 640px) {
          .arm-1 {
            transform: translate(-50%, -50%) rotate(45deg) translateY(-30px);
          }

          .arm-2 {
            transform: translate(-50%, -50%) rotate(135deg) translateY(-30px);
          }

          .arm-3 {
            transform: translate(-50%, -50%) rotate(225deg) translateY(-30px);
          }

          .arm-4 {
            transform: translate(-50%, -50%) rotate(315deg) translateY(-30px);
          }
        }

        .propeller {
          position: absolute;
          width: 40px;
          height: 40px;
          top: 50%;
          left: 50%;
          transform-style: preserve-3d;
        }

        @media (min-width: 640px) {
          .propeller {
            width: 50px;
            height: 50px;
          }
        }

        .prop-1 {
          transform: translate(-50%, -50%) rotate(45deg) translateY(-45px);
        }

        .prop-2 {
          transform: translate(-50%, -50%) rotate(135deg) translateY(-45px);
        }

        .prop-3 {
          transform: translate(-50%, -50%) rotate(225deg) translateY(-45px);
        }

        .prop-4 {
          transform: translate(-50%, -50%) rotate(315deg) translateY(-45px);
        }

        @media (min-width: 640px) {
          .prop-1 {
            transform: translate(-50%, -50%) rotate(45deg) translateY(-60px);
          }

          .prop-2 {
            transform: translate(-50%, -50%) rotate(135deg) translateY(-60px);
          }

          .prop-3 {
            transform: translate(-50%, -50%) rotate(225deg) translateY(-60px);
          }

          .prop-4 {
            transform: translate(-50%, -50%) rotate(315deg) translateY(-60px);
          }
        }

        .propeller-blade {
          position: absolute;
          width: 16px;
          height: 5px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 3px;
          top: 50%;
          left: 50%;
          transform-origin: left center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.3);
        }

        @media (min-width: 640px) {
          .propeller-blade {
            width: 20px;
            height: 6px;
          }
        }

        .blade-1 {
          transform: translate(-50%, -50%) rotate(0deg) translateX(10px);
        }

        .blade-2 {
          transform: translate(-50%, -50%) rotate(90deg) translateX(10px);
        }

        .blade-3 {
          transform: translate(-50%, -50%) rotate(180deg) translateX(10px);
        }

        .blade-4 {
          transform: translate(-50%, -50%) rotate(270deg) translateX(10px);
        }

        .prop-1 .propeller-blade {
          animation: propeller-spin 0.08s linear infinite;
        }

        .prop-2 .propeller-blade {
          animation: propeller-spin 0.09s linear infinite reverse;
        }

        .prop-3 .propeller-blade {
          animation: propeller-spin 0.08s linear infinite;
        }

        .prop-4 .propeller-blade {
          animation: propeller-spin 0.09s linear infinite reverse;
        }

        @keyframes propeller-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(10px);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateX(10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }

        .animate-slide-up-delay {
          animation: slide-up 1s ease-out 0.3s both;
        }

        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}

