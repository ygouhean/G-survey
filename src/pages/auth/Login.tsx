import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { MapPin } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Utiliser l'identifiant comme email pour la connexion
      await login(identifier, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Connexion
              </h2>
              <p className="text-black-600 dark:text-black-400 mt-2">
                Bienvenue ! Connectez-vous à votre compte
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Email</strong>
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input"
                  placeholder="email@exemple.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <strong>Mot de passe</strong>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-black-600 dark:text-black-400 text-sm">
                Vous n'avez pas de compte ?{' '}
                <Link to="/register" className="text-primary-600 hover:underline font-medium">
                  S'inscrire
                </Link>
              </p>
            </div>

            {/* Legal Links */}
            <div className="mt-6 text-center text-xs text-black-500 dark:text-gray-400">
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
