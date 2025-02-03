import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Account, Platform, Subscription } from '../types/database';
import { format } from 'date-fns';

interface ProfileWithDetails extends Profile {
  account: Account & {
    platform: Platform;
  };
  subscription?: Subscription;
}

export const Profiles = () => {
  const [profiles, setProfiles] = useState<ProfileWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    // First get all profiles with their account and platform details
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        account:accounts(
          *,
          platform:platforms(*)
        )
      `)
      .eq('accounts.is_active', true)
      .order('profile_name');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    // Get all active subscriptions
    const { data: subscriptionsData, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active');

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      return;
    }

    // Map subscriptions to profiles
    const profilesWithSubscriptions = profilesData?.map(profile => {
      const subscription = subscriptionsData?.find(sub => 
        sub.profiles.includes(profile.id)
      );
      return {
        ...profile,
        subscription
      };
    }) || [];

    setProfiles(profilesWithSubscriptions);
    setLoading(false);
  };

  const filteredProfiles = profiles.filter(profile => {
    if (filter === 'available') return profile.is_available;
    if (filter === 'occupied') return !profile.is_available;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Profils de Streaming</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'available'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Disponibles
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'occupied'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Occupés
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Chargement des profils...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {profile.account.name || profile.account.account_email} - {profile.profile_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {profile.account.platform.name}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      profile.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {profile.is_available ? 'Disponible' : 'En Utilisation'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Email du Compte</span>
                    <span className="font-medium">{profile.account.account_email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Expiration du Compte</span>
                    <span className="font-medium">
                      {new Date(profile.account.expiration_date).toLocaleDateString()}
                    </span>
                  </div>
                  {!profile.is_available && profile.subscription && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Fin d'Abonnement</span>
                      <span className="font-medium text-red-600">
                        {format(new Date(profile.subscription.end_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Statut du Compte</span>
                    <span className={`font-medium ${
                      profile.account.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {profile.account.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};