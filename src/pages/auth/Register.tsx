import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    sector: '',
    organizationType: '',
    acceptTerms: false
  })

  const countries = [
    'Afghanistan', 'Afrique du Sud', 'Algérie', 'Allemagne', 'Arabie Saoudite', 
    'Argentine', 'Australie', 'Belgique', 'Bénin', 'Brésil', 'Burkina Faso', 
    'Burundi', 'Cameroun', 'Canada', 'Centrafrique', 'Chine', 'Colombie', 
    'Congo', 'Côte d\'Ivoire', 'Égypte', 'Espagne', 'États-Unis', 'Éthiopie', 
    'France', 'Gabon', 'Ghana', 'Guinée', 'Haïti', 'Inde', 'Italie', 'Japon', 
    'Kenya', 'Madagascar', 'Mali', 'Maroc', 'Mauritanie', 'Mexique', 'Niger', 
    'Nigéria', 'Ouganda', 'Pakistan', 'Royaume-Uni', 'Rwanda', 'Sénégal', 
    'Somalie', 'Soudan', 'Tanzanie', 'Tchad', 'Togo', 'Tunisie', 'Turquie'
  ].sort()

  const sectors = [
    'Agriculture', 
    'Environnement',
    'Santé', 
    'Éducation', 
    'Commerce', 
    'Industrie', 
    'Services', 
    'Technologie', 
    'Finance', 
    'Transport', 
    'Construction',
    'Énergie',
    'Télécommunications',
    'Tourisme',
    'Autre'
  ]

  const organizationTypes = [
    'ONG',
    'Entreprise privée',
    'Organisation gouvernementale',
    'Organisation internationale',
    'Institution académique',
    'Association',
    'Coopérative',
    'Startup',
    'Autre'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.username || 
        !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires')
      return false
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse e-mail valide')
      return false
    }

    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
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

    setLoading(true)

    try {
      // Envoyer les données d'inscription au serveur
      const response = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        country: formData.country,
        sector: formData.sector,
        organizationType: formData.organizationType
      })

      setSuccess(true)
      
      // Auto-login après inscription réussie si un token est retourné
      if (response.data.data?.token) {
        const { user, token } = response.data.data
        // Mettre à jour le store auth
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Rediriger vers le dashboard après un court délai
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        // Sinon rediriger vers la page de connexion
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative"
         style={{
           backgroundImage: 'url(/uploads/img/background.png)'
         }}>
      
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 bg-opacity-65">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="flex items-center justify-center mb-4 hover:opacity-80 transition-opacity">
                <img 
                src="/uploads/img/logolight.png" alt="G-Survey Logo" 
                className="w-10 h-10 object-cover rounded-full" 
                />
                <h1 className="text-3xl font-bold text-primary-600 ml-2">G-Survey</h1>
              </Link>
              <h2 className="text-2xl font-semibold text-black-900 dark:text-white">
                Créer un compte
              </h2>
              <p className="text-black-600 dark:text-black-400 mt-2">
                Rejoignez-nous et commencez à collecter des données
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
                Inscription réussie ! Redirection vers la page de connexion...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input"
                    placeholder="Votre nom"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                    Prénoms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input"
                    placeholder="Vos prénoms"
                    required
                  />
                </div>
              </div>

              {/* Genre et Nom d'utilisateur */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                    Genre
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Sélectionner</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                    Nom d'utilisateur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input"
                    placeholder="Nom d'utilisateur"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              {/* Mots de passe */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black-500 hover:text-black-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black-500 hover:text-black-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                    Pays
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Sélectionner un pays</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                    Secteur d'activité
                  </label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Sélectionner un secteur</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
                  Type d'organisation
                </label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Sélectionner le type</option>
                  {organizationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  required
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-black-700 dark:text-black-300">
                  J'accepte les{' '}
                  <Link to="/terms" className="text-primary-600 hover:underline">
                    conditions d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link to="/privacy" className="text-primary-600 hover:underline">
                    politique de confidentialité
                  </Link>
                  <span className="text-red-500"> *</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-black-600 dark:text-black-400">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="text-primary-600 hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

