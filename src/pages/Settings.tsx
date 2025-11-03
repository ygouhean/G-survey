import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile settings
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [gender, setGender] = useState('')
  const [country, setCountry] = useState('')
  const [sector, setSector] = useState('')
  const [organizationType, setOrganizationType] = useState('')
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Charger les données de l'utilisateur quand elles changent
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setUsername(user.username || '')
      setGender(user.gender || '')
      setCountry(user.country || '')
      setSector(user.sector || '')
      setOrganizationType(user.organizationType || '')
    }
  }, [user])

  // Listes pour les sélecteurs
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
    'Agriculture', 'Santé', 'Éducation', 'Commerce', 'Industrie', 'Services', 
    'Technologie', 'Finance', 'Transport', 'Construction', 'Énergie',
    'Télécommunications', 'Tourisme', 'Autre'
  ]

  const organizationTypes = [
    'ONG', 'Entreprise privée', 'Organisation gouvernementale',
    'Organisation internationale', 'Institution académique', 'Association',
    'Coopérative', 'Startup', 'Autre'
  ]

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await api.put('/auth/update-profile', {
        firstName,
        lastName,
        phone,
        username,
        gender,
        country,
        sector,
        organizationType
      })

      updateUser(response.data.data)
      setMessage('✅ Profil mis à jour avec succès')
    } catch (error: any) {
      setMessage('❌ ' + (error.response?.data?.message || 'Erreur lors de la mise à jour'))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage('❌ Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 6) {
      setMessage('❌ Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      })

      setMessage('✅ Mot de passe modifié avec succès')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage('❌ ' + (error.response?.data?.message || 'Erreur lors du changement de mot de passe'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gérez vos préférences et votre compte
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'profile'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          👤 Profil
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'security'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          🔒 Sécurité
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'preferences'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          ⚙️ Préférences
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅')
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Informations personnelles</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-primary-600 text-white flex items-center justify-center text-3xl font-bold">
                {user?.firstName[0]}{user?.lastName[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Informations de base */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Informations de base
                </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                      Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                      Prénoms <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                  required
                />
              </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Genre
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="input"
                    >
                      <option value="">Sélectionner</option>
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input"
                      placeholder="nom.utilisateur"
                    />
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Informations de contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                      className="input bg-gray-100 dark:bg-gray-700"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  placeholder="+33 6 12 34 56 78"
                />
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Informations professionnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Pays
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="input"
                    >
                      <option value="">Sélectionner un pays</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Secteur d'activité
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="input"
                    >
                      <option value="">Sélectionner un secteur</option>
                      {sectors.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Type d'organisation
                    </label>
                    <select
                      value={organizationType}
                      onChange={(e) => setOrganizationType(e.target.value)}
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
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Changer le mot de passe</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Changement...' : '🔒 Changer le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Préférences d'affichage</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium">Mode sombre</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Activer le thème sombre
                  </div>
                </div>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    document.documentElement.classList.toggle('dark', e.target.checked)
                  }}
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Recevoir des notifications pour les nouvelles réponses
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium">Rapports hebdomadaires</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Recevoir un résumé hebdomadaire par email
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5"
                />
              </label>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Langue et région</h2>
            
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Langue
                </label>
                <select className="input">
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fuseau horaire
                </label>
                <select className="input">
                  <option>Europe/Paris (GMT+1)</option>
                  <option>Europe/London (GMT)</option>
                  <option>America/New_York (GMT-5)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
