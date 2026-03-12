'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleSelectionModalProps {
  email: string;
  provider: string;
  onRoleSelect: (role: string) => Promise<void>;
  onCancel: () => void;
}

export default function RoleSelectionModal({
  email,
  provider,
  onRoleSelect,
  onCancel
}: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('candidat');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onRoleSelect(selectedRole);
    } catch (error) {
      console.error('Error during role selection:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'facebook':
        return 'Facebook';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return provider;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Bienvenue sur JobCallCenter</h2>
        <p className="text-gray-600 mb-6">
          Vous vous connectez pour la première fois avec {getProviderName(provider)}. 
          Veuillez sélectionner votre rôle pour continuer.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <input
                id="role-candidat"
                name="role"
                type="radio"
                value="candidat"
                checked={selectedRole === 'candidat'}
                onChange={() => setSelectedRole('candidat')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="role-candidat" className="ml-3 block text-sm font-medium text-gray-700">
                Je cherche un emploi (Candidat)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="role-employeur"
                name="role"
                type="radio"
                value="employeur"
                checked={selectedRole === 'employeur'}
                onChange={() => setSelectedRole('employeur')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="role-employeur" className="ml-3 block text-sm font-medium text-gray-700">
                Je recrute (Employeur)
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Traitement en cours...' : 'Continuer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
