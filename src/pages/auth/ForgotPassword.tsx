import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse e-mail valide')
      setLoading(false)
      return
    }

    try {
      // Envoyer la demande de réinitialisation au serveur
      await api.post('/auth/forgot-password', { email })
      setSuccess(true)
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue. Veuillez réessayer.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative"
         style={{
           backgroundImage: 'url(/images/background.png)'
         }}>
      
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 bg-opacity-65">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="flex items-center justify-center mb-4 hover:opacity-80 transition-opacity">
                <img 
                src="/images/logolight.png" alt="G-Survey Logo" 
                className="w-10 h-10 object-cover rounded-full" 
                />
                <h1 className="text-3xl font-bold text-primary-600 ml-2">G-Survey</h1>
              </Link>
              <h2 className="text-2xl font-semibold text-black-900 dark:text-white">
                Mot de passe oublié ?
              </h2>
              <p className="text-black-600 dark:text-black-400 mt-2">
                Entrez votre email pour réinitialiser votre mot de passe
              </p>
            </div>

            {/* Success Message */}
            {success ? (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 text-center mb-2">
                    Email envoyé !
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-center text-sm">
                    Si un compte existe avec l'adresse <strong>{email}</strong>, 
                    vous recevrez un email avec les instructions pour réinitialiser 
                    votre mot de passe.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-semibold mb-1">Vérifiez votre boîte de réception</p>
                      <p>
                        L'email peut prendre quelques minutes à arriver. 
                        N'oubliez pas de vérifier votre dossier spam.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="w-full btn btn-primary py-3 text-lg font-semibold flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Retour à la connexion
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
                    <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input pl-10"
                        placeholder="votre@email.com"
                        required
                        autoFocus
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black-400" />
                    </div>
                    <p className="mt-2 text-xs text-black-500 dark:text-black-400">
                      Nous vous enverrons un lien pour réinitialiser votre mot de passe
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="flex items-center justify-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Link>
                </div>
              </>
            )}

            {/* Legal Links */}
            <div className="mt-6 text-center text-xs text-black-500 dark:text-black-400">
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


