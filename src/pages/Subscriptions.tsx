import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Subscription, Customer, Profile, SubscriptionPlan, Account, Platform } from '../types/database';
import { Modal } from '../components/Modal';
import { addDays, format } from 'date-fns';
import { Download, Trash2 } from 'lucide-react';
import { generateInvoicePDF } from '../utils/invoice';

interface SubscriptionWithDetails extends Subscription {
  customer: Customer;
  plan: SubscriptionPlan;
  profiles_data: Profile[];
}

interface AvailableProfile extends Profile {
  account: Account & {
    platform: Platform;
  };
}

interface AvailableAccount extends Account {
  platform: Platform;
  profiles: Profile[];
}

export const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<AvailableProfile[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<AvailableAccount[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithDetails | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AvailableAccount | null>(null);
  const [newSubscription, setNewSubscription] = useState({
    customer_id: '',
    account_id: '',
    profiles: [] as string[],
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: addDays(new Date(), 30).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchCustomers();
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      fetchAvailableProfiles(selectedPlan.platform_id);
      fetchAvailableAccounts(selectedPlan.platform_id);
    }
  }, [selectedPlan]);

  const fetchSubscriptions = async () => {
    const { data: subsData, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        customer:customers(*),
        plan:subscription_plans(*)
      `)
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      return;
    }

    // Then get all profiles referenced in subscriptions
    const allProfileIds = subsData?.flatMap(sub => sub.profiles) || [];
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', allProfileIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    // Combine the data
    const subscriptionsWithDetails = subsData?.map(sub => ({
      ...sub,
      profiles_data: profilesData?.filter(profile => sub.profiles.includes(profile.id)) || []
    })) || [];

    setSubscriptions(subscriptionsWithDetails);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching customers:', error);
      return;
    }

    setCustomers(data || []);
  };

  const fetchAvailableProfiles = async (platformId: string) => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        account:accounts!inner(
          *,
          platform:platforms(*)
        )
      `)
      .eq('is_available', true)
      .eq('account.platform_id', platformId)
      .eq('account.is_active', true);

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    setAvailableProfiles(profiles || []);
  };

  const fetchAvailableAccounts = async (platformId: string) => {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select(`
        *,
        platform:platforms(*),
        profiles!inner(*)
      `)
      .eq('platform_id', platformId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching accounts:', error);
      return;
    }

    // Filter accounts that have enough available profiles
    const accountsWithAvailableProfiles = accounts?.filter(account => {
      const availableProfilesCount = account.profiles.filter(p => p.is_available).length;
      return availableProfilesCount >= (selectedPlan?.profiles_count || 1);
    });

    setAvailableAccounts(accountsWithAvailableProfiles || []);
  };

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select(`
        *,
        platform:platforms(*)
      `)
      .order('profiles_count');

    if (error) {
      console.error('Error fetching plans:', error);
      return;
    }

    setPlans(data || []);
  };

  const handlePlanChange = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    setSelectedPlan(plan || null);
    setNewSubscription(prev => ({
      ...prev,
      plan_id: planId,
      profiles: [],
      account_id: ''
    }));
    setSelectedAccount(null);
  };

  const handleAccountChange = (accountId: string) => {
    const account = availableAccounts.find(a => a.id === accountId);
    setSelectedAccount(account || null);
    
    if (account && selectedPlan) {
      const availableProfiles = account.profiles
        .filter(p => p.is_available)
        .slice(0, selectedPlan.profiles_count)
        .map(p => p.id);
        
      setNewSubscription(prev => ({
        ...prev,
        account_id: accountId,
        profiles: availableProfiles
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan || !selectedAccount || newSubscription.profiles.length === 0) return;

    // Create subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([{
        customer_id: newSubscription.customer_id,
        profiles: newSubscription.profiles,
        plan_id: newSubscription.plan_id,
        start_date: newSubscription.start_date,
        end_date: newSubscription.end_date,
        status: 'active',
      }]);

    if (subscriptionError) {
      console.error('Error adding subscription:', subscriptionError);
      return;
    }

    // Mark profiles as unavailable
    const { error: profilesError } = await supabase
      .from('profiles')
      .update({ is_available: false })
      .in('id', newSubscription.profiles);

    if (profilesError) {
      console.error('Error updating profiles:', profilesError);
      return;
    }

    setIsModalOpen(false);
    setNewSubscription({
      customer_id: '',
      account_id: '',
      profiles: [],
      plan_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: addDays(new Date(), 30).toISOString().split('T')[0],
    });
    setSelectedPlan(null);
    setSelectedAccount(null);
    fetchSubscriptions();
  };

  const handleStartDateChange = (date: string) => {
    const startDate = new Date(date);
    setNewSubscription({
      ...newSubscription,
      start_date: date,
      end_date: addDays(startDate, 30).toISOString().split('T')[0],
    });
  };

  const handleViewInvoice = (subscription: SubscriptionWithDetails) => {
    setSelectedSubscription(subscription);
    setShowInvoice(true);
  };

  const handleDownloadInvoice = async () => {
    if (selectedSubscription) {
      await generateInvoicePDF(selectedSubscription);
    }
  };

  const handleDeleteSubscription = async (subscription: SubscriptionWithDetails) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      return;
    }

    // Mark profiles as available again
    const { error: profilesError } = await supabase
      .from('profiles')
      .update({ is_available: true })
      .in('id', subscription.profiles);

    if (profilesError) {
      console.error('Error updating profiles:', profilesError);
      return;
    }

    // Delete subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscription.id);

    if (subscriptionError) {
      console.error('Error deleting subscription:', subscriptionError);
      return;
    }

    fetchSubscriptions();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Nouvel Abonnement
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
          setSelectedAccount(null);
          setNewSubscription({
            customer_id: '',
            account_id: '',
            profiles: [],
            plan_id: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: addDays(new Date(), 30).toISOString().split('T')[0],
          });
        }}
        title="Nouvel Abonnement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <select
              value={newSubscription.customer_id}
              onChange={(e) => setNewSubscription({ ...newSubscription, customer_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="">Sélectionner un Client</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Plan</label>
            <select
              value={newSubscription.plan_id}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="">Sélectionner un Plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.profiles_count} profils - {plan.price_ar.toLocaleString()} Ar)
                </option>
              ))}
            </select>
          </div>

          {selectedPlan && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Compte</label>
              <select
                value={newSubscription.account_id}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              >
                <option value="">Sélectionner un compte</option>
                {availableAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name || account.account_email} ({account.profiles.filter(p => p.is_available).length} profils disponibles)
                  </option>
                ))}
              </select>
              {availableAccounts.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  Aucun compte disponible avec suffisamment de profils pour ce plan
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de Début</label>
            <input
              type="date"
              value={newSubscription.start_date}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de Fin</label>
            <input
              type="date"
              value={newSubscription.end_date}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              La période d'abonnement est fixée à 30 jours
            </p>
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
              disabled={!selectedPlan || !selectedAccount || newSubscription.profiles.length === 0}
            >
              Créer l'Abonnement
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showInvoice}
        onClose={() => {
          setShowInvoice(false);
          setSelectedSubscription(null);
        }}
        title="Aperçu de la Facture"
      >
        {selectedSubscription && (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold text-indigo-600">StreamShare</h2>
              <p className="text-sm text-gray-500">
                Facture #{selectedSubscription.id.slice(0, 8)}
              </p>
              <p className="text-sm text-gray-500">
                Date: {format(new Date(selectedSubscription.created_at), 'PPP')}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Informations Client</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{selectedSubscription.customer.name}</p>
                {selectedSubscription.customer.email && (
                  <p className="text-sm text-gray-600">{selectedSubscription.customer.email}</p>
                )}
                {selectedSubscription.customer.phone && (
                  <p className="text-sm text-gray-600">{selectedSubscription.customer.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Détails de l'Abonnement</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium">{selectedSubscription.plan.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Profils:</span>
                  <ul className="mt-1 space-y-1">
                    {selectedSubscription.profiles_data.map(profile => (
                      <li key={profile.id} className="text-sm">
                        • {profile.profile_name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Période</span>
                  <span className="font-medium">
                    {format(new Date(selectedSubscription.start_date), 'PP')} - {format(new Date(selectedSubscription.end_date), 'PP')}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {selectedSubscription.plan.price_ar.toLocaleString()} Ar
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 border-t pt-4">
              <p>Merci de votre confiance !</p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Download size={20} />
                <span>Télécharger PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {loading ? (
        <div className="text-center py-4">Chargement des abonnements...</div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profils
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.customer.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subscription.customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subscription.plan.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {subscription.profiles_data.map(profile => (
                        <div key={profile.id} className="text-sm text-gray-600">
                          {profile.profile_name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'expired'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.status === 'active' ? 'Actif' : 
                       subscription.status === 'expired' ? 'Expiré' : 'Annulé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(new Date(subscription.start_date), 'PP')} -
                      {format(new Date(subscription.end_date), 'PP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewInvoice(subscription)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Facture
                    </button>
                    <button
                      onClick={() => handleDeleteSubscription(subscription)}
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