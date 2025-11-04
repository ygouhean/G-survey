import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function UserManagement() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // Vérifier les permissions
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])
  
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'field_agent',
    username: '',
    gender: '',
    country: '',
    sector: '',
    organizationType: ''
  })

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

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await api.get('/auth/users')
      setUsers(response.data.data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        phone: user.phone || '',
        role: user.role,
        username: user.username || '',
        gender: user.gender || '',
        country: user.country || '',
        sector: user.sector || '',
        organizationType: user.organizationType || ''
      })
    } else {
      setEditingUser(null)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'field_agent',
        username: '',
        gender: '',
        country: '',
        sector: '',
        organizationType: ''
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingUser) {
        // Update user
        await api.put(`/auth/users/${editingUser.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          username: formData.username,
          gender: formData.gender,
          country: formData.country,
          sector: formData.sector,
          organizationType: formData.organizationType
        })
        await loadUsers()
        setShowModal(false)
        alert('✅ Utilisateur mis à jour avec succès')
      } else {
        // Create new user
        await api.post('/auth/create-user', formData)
        await loadUsers()
        setShowModal(false)
        alert('✅ Utilisateur créé avec succès')
      }
    } catch (error: any) {
      console.error('Error saving user:', error)
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Voulez-vous vraiment ${currentStatus ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
      return
    }

    try {
      await api.patch(`/auth/users/${userId}/toggle-status`)
      await loadUsers()
      alert(`✅ Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès`)
    } catch (error: any) {
      console.error('Error toggling user status:', error)
      alert(error.response?.data?.message || 'Erreur lors de la modification du statut')
    }
  }

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setDeleting(true)
    try {
      await api.delete(`/auth/users/${userToDelete.id}`)
      await loadUsers()
      setShowDeleteModal(false)
      setUserToDelete(null)
      alert('✅ Utilisateur supprimé avec succès')
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(error.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les accès et les rôles des utilisateurs
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          ➕ Nouvel Utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Utilisateurs
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {users.length}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Administrateurs
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Superviseurs
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {users.filter(u => u.role === 'supervisor').length}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Agents Terrain
          </div>
          <div className="text-3xl font-bold text-green-600">
            {users.filter(u => u.role === 'field_agent').length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Utilisateur
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Rôle
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Statut
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Dernière connexion
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      user.role === 'admin' ? 'badge-danger' :
                      user.role === 'supervisor' ? 'badge-info' :
                      'badge-success'
                    }`}>
                      {user.role === 'admin' ? '👑 Admin' :
                       user.role === 'supervisor' ? '👔 Superviseur' :
                       '👤 Agent'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      user.isActive ? 'badge-success' : 'badge-danger'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                      : 'Jamais'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={`p-2 rounded ${
                          user.isActive
                            ? 'hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-600'
                            : 'hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600'
                        }`}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {user.isActive ? '🔒' : '✅'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer"
                        disabled={false}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Informations de base
                </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                      Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                      Prénoms *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Genre
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="input"
                      placeholder="nom.utilisateur"
                    />
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Informations de contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                    disabled={!!editingUser}
                  />
                    {editingUser && (
                      <p className="text-xs text-gray-500 mt-1">
                        L'email ne peut pas être modifié
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                      placeholder="+33 6 12 34 56 78"
                  />
                  </div>
                </div>
                </div>

              {/* Informations professionnelles */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Informations professionnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Pays
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
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
                      value={formData.organizationType}
                      onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
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

              {/* Rôle et Mot de passe */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Accès et Sécurité
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rôle *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="field_agent">👤 Agent de terrain</option>
                    <option value="supervisor">👔 Superviseur</option>
                    <option value="admin">👑 Administrateur</option>
                  </select>
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mot de passe *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        required
                        minLength={6}
                        placeholder="Minimum 6 caractères"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Confirmer la suppression
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                  {userToDelete.firstName[0]}{userToDelete.lastName[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {userToDelete.firstName} {userToDelete.lastName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {userToDelete.email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Rôle : {userToDelete.role === 'admin' ? '👑 Admin' : 
                            userToDelete.role === 'supervisor' ? '👔 Superviseur' : 
                            '👤 Agent'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées à cet utilisateur seront définitivement supprimées.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setUserToDelete(null)
                }}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn bg-red-600 hover:bg-red-700 text-white"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Suppression...
                  </>
                ) : (
                  <>
                    🗑️ Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
