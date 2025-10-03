import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'field_agent'
  })

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
        role: user.role
      })
    } else {
      setEditingUser(null)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'field_agent'
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingUser) {
        // Update user (not implemented in backend yet)
        alert('La modification d\'utilisateur sera implémentée prochainement')
      } else {
        // Create new user
        await api.post('/auth/register', formData)
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
      // This endpoint would need to be implemented in backend
      alert('La fonctionnalité sera implémentée prochainement')
    } catch (error) {
      console.error('Error toggling user status:', error)
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
                <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        className={`p-2 rounded ${
                          user.isActive
                            ? 'hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600'
                            : 'hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600'
                        }`}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {user.isActive ? '🔒' : '✅'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prénom *
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
                    Nom *
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
                  />
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
                    />
                  </div>
                )}

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
    </div>
  )
}
