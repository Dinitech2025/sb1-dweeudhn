import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Account, Platform, Profile } from '../types/database';
import { Modal } from '../components/Modal';
import { Users, Trash2, Edit2 } from 'lucide-react';

interface AccountWithDetails extends Account {
  platform: Platform;
  profiles: Profile[];
}

export const Accounts = () => {
  const [accounts, setAccounts] = useState<AccountWithDetails[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithDetails | null>(null);
  const [showProfiles, setShowProfiles] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountWithDetails | null>(null);
  const [formData, setFormData] = useState({
    platform_id: '',
    name: '',
    account_email: '',
    password: '',
    expiration_date: '',
    max_profiles: 1,
  });

  useEffect(() => {
    fetchAccounts();
    fetchPlatforms();
  }, []);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        platform:platforms(*),
        profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      return;
    }

    setAccounts(data || []);
    setLoading(false);
  };

  const fetchPlatforms = async () => {
    const { data, error } = await supabase
      .from('platforms')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching platforms:', error);
      return;
    }

    setPlatforms(data || []);
  };

  const handleEdit = (account: AccountWithDetails) => {
    setEditingAccount(account);
    setFormData({
      platform_id: account.platform_id,
      name: account.name || '',
      account_email: account.account_email,
      password: account.password || '',
      expiration_date: account.expiration_date,
      max_profiles: account.max_profiles,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (account: AccountWithDetails) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ce compte ?`)) {
      return;
    }

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', account.id);

    if (error) {
      console.error('Error deleting account:', error);
      alert('Impossible de supprimer le compte. Il est peut-être utilisé par des abonnements.');
      return;
    }

    fetchAccounts();
  };

  const handleViewProfiles = (account: AccountWithDetails) => {
    setSelectedAccount(account);
    setShowProfiles(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingAccount) {
      const { error } = await supabase
        .from('accounts')
        .update(formData)
        .eq('id', editingAccount.id);

      if (error) {
        console.error('Error updating account:', error);
        return;
      }
    } else {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert([{
          ...formData,
          is_active: true,
        }])
        .select()
        .single();

      if (accountError || !account) {
        console.error('Error adding account:', accountError);
        return;
      }

      // Create profiles for the account
      const profiles = Array.from({ length: formData.max_profiles }, (_, i) => ({
        account_id: account.id,
        profile_name: `Profile ${i + 1}`,
        is_available: true
      }));

      const { error: profilesError } = await supabase
        .from('profiles')
        .insert(profiles);

      if (profilesError) {
        console.error('Error creating profiles:', profilesError);
        return;
      }
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingAccount(null);
    setFormData({
      platform_id: '',
      name: '',
      account_email: '',
      password: '',
      expiration_date: '',
      max_profiles: 1,
    });
    fetchAccounts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Comptes de Streaming</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Ajouter un Compte
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingAccount(null);
          setFormData({
            platform_id: '',
            name: '',
            account_email: '',
            password: '',
            expiration_date: '',
            max_profiles: 1,
          });
        }}
        title={isEditMode ? "Modifier le Compte" : "Ajouter un Compte"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Plateforme</label>
            <select
              value={formData.platform_id}
              onChange={(e) => setFormData({ ...formData, platform_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="">Sélectionner une Plateforme</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du Compte</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.account_email}
              onChange={(e) => setFormData({ ...formData, account_email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date d'Expiration</label>
            <input
              type="date"
              value={formData.expiration_date}
              onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Profils</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.max_profiles}
              onChange={(e) => setFormData({ ...formData, max_profiles: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {isEditMode ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showProfiles}
        onClose={() => {
          setShowProfiles(false);
          setSelectedAccount(null);
        }}
        title="Profils du Compte"
      >
        {selectedAccount && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold">{selectedAccount.platform.name}</h3>
              <p className="text-sm text-gray-600">{selectedAccount.account_email}</p>
            </div>

            <div className="space-y-4">
              {selectedAccount.profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{profile.profile_name}</p>
                    <p className="text-sm text-gray-500">
                      {profile.is_available ? 'Disponible' : 'En Utilisation'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    profile.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.is_available ? 'Disponible' : 'En Utilisation'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {loading ? (
        <div className="text-center py-4">Chargement des comptes...</div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plateforme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profils
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {account.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {account.platform.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{account.account_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{account.expiration_date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      account.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {account.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {account.profiles.filter(p => p.is_available).length} / {account.max_profiles} disponibles
                      </span>
                      <button
                        onClick={() => handleViewProfiles(account)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Users size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(account)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
