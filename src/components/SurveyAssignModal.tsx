import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import surveyService from '../services/surveyService';
import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  teamId?: string | null;
}

interface SurveyAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
  surveyCreatedById: string;
  currentlyAssigned: User[];
  onAssignComplete: () => void;
}

const SurveyAssignModal: React.FC<SurveyAssignModalProps> = ({
  isOpen,
  onClose,
  surveyId,
  surveyCreatedById,
  currentlyAssigned,
  onAssignComplete,
}) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen, surveyId]);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      const response = await surveyService.getAssignableUsers(surveyId);
      
      // Filter out already assigned users
      const alreadyAssignedIds = currentlyAssigned.map(u => u.id);
      const filteredUsers = response.data.filter(
        (u: User) => !alreadyAssignedIds.includes(u.id)
      );
      
      setAvailableUsers(filteredUsers);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      setError('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await surveyService.assignSurvey(surveyId, selectedUsers);
      setSuccess(`${selectedUsers.length} utilisateur(s) assigné(s) avec succès`);
      setTimeout(() => {
        setSuccess('');
        setSelectedUsers([]);
        onAssignComplete();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (userId: string) => {
    try {
      setLoading(true);
      setError('');
      await surveyService.unassignSurvey(surveyId, [userId]);
      setSuccess('Utilisateur retiré avec succès');
      setTimeout(() => {
        setSuccess('');
        onAssignComplete();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du retrait');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    return availableUsers.filter(user =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'supervisor':
        return 'Superviseur';
      case 'field_agent':
        return 'Agent de terrain';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'field_agent':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  const filteredUsers = getFilteredUsers();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Assigner le sondage
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {currentUser?.role === 'admin' ? (
                <>
                  <strong>En tant qu'administrateur,</strong> vous pouvez assigner ce sondage à des agents de terrain et des superviseurs.
                </>
              ) : (
                <>
                  <strong>En tant que superviseur,</strong> vous pouvez assigner ce sondage aux agents de terrain.
                  <br />
                  💡 <em>Les agents sans équipe que vous assignez seront automatiquement ajoutés à votre équipe.</em>
                </>
              )}
            </p>
          </div>

          {/* Currently Assigned */}
          {currentlyAssigned.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Utilisateurs déjà assignés ({currentlyAssigned.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentlyAssigned.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    {/* Hide "Remove" button if supervisor tries to remove himself from a survey he didn't create */}
                    {!(user.id === currentUser?.id && currentUser?.role === 'supervisor' && surveyCreatedById !== currentUser?.id) && (
                      <button
                        onClick={() => handleUnassign(user.id)}
                        disabled={loading}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Users */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Assigner à de nouveaux utilisateurs
            </h3>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Select All */}
            {filteredUsers.length > 0 && (
              <div className="mb-3">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedUsers.length === filteredUsers.length
                    ? 'Tout désélectionner'
                    : 'Tout sélectionner'}
                </button>
              </div>
            )}

            {/* Users List */}
            {loading && availableUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {searchTerm
                    ? 'Aucun utilisateur ne correspond à votre recherche'
                    : 'Aucun utilisateur disponible pour l\'assignation'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {currentUser?.role === 'supervisor' && !user.teamId && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Disponible
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedUsers.length} utilisateur(s) sélectionné(s)
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleAssign}
              disabled={loading || selectedUsers.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Assignation...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Assigner</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyAssignModal;

