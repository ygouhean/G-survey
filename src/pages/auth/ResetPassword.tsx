import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { MapPin, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import api from '../../services/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation manquant. Veuillez utiliser le lien reçu par email.')
    }
  }, [token])

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return false
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    if (!token) {
      setError('Token de réinitialisation manquant')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-password', {
        token,
        password
      })

      setSuccess(true)

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue. Veuillez réessayer ou demander un nouveau lien.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative"
         style={{
           backgroundImage: 'url(/uploads/img/background.png)'
         }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-primary-700/90"></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/uploads/img/logolight.png" className="flex items-center justify-center mb-4 hover:opacity-80 transition-opacity rounded-full">
                <MapPin className="w-10 h-10 text-primary-600 rounded-full" />
                <h1 className="text-3xl font-bold text-primary-600 ml-2">G-Survey</h1>
              </Link>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {success ? 'Mot de passe réinitialisé !' : 'Réinitialiser le mot de passe'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {success 
                  ? 'Votre mot de passe a été modifié avec succès' 
                  : 'Entrez votre nouveau mot de passe'}
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 text-center mb-2">
                    ✅ Réinitialisation réussie !
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-center text-sm">
                    Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion...
                  </p>
                </div>

                <Link
                  to="/login"
                  className="w-full btn btn-primary py-3 text-lg font-semibold flex items-center justify-center"
                >
                  Aller à la connexion →
                </Link>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Lock className="inline w-4 h-4 mr-1" />
                      Nouveau mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input pr-10"
                        placeholder="••••••••"
                        required
                        minLength={8}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Le mot de passe doit contenir au moins 8 caractères
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmer le mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input pr-10"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </>
            )}

            {/* Legal Links */}
            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              <Link to="/terms" className="hover:underline">
                Conditions d'utilisation
              </Link>
              {' • '}
              <Link to="/privacy" className="hover:underline">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

