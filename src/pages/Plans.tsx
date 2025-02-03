import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SubscriptionPlan, Platform } from '../types/database';
import { Modal } from '../components/Modal';

interface PlanWithPlatform extends SubscriptionPlan {
  platform: Platform;
}

export const Plans = () => {
  const [plans, setPlans] = useState<PlanWithPlatform[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanWithPlatform | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [formData, setFormData] = useState({
    platform_id: '',
    name: '',
    profiles_count: 1,
    price_ar: 0,
    duration_months: 1
  });

  useEffect(() => {
    fetchPlans();
    fetchPlatforms();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select(`
        *,
        platform:platforms(*)
      `)
      .order('profiles_count', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return;
    }

    setPlans(data || []);
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

  const handleEdit = (plan: PlanWithPlatform) => {
    setEditingPlan(plan);
    setSelectedPlatform(plan.platform);
    setFormData({
      platform_id: plan.platform_id,
      name: plan.name,
      profiles_count: plan.profiles_count,
      price_ar: plan.price_ar,
      duration_months: plan.duration_months || 1
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handlePlatformChange = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    setSelectedPlatform(platform || null);
    setFormData(prev => ({
      ...prev,
      platform_id: platformId,
      profiles_count: Math.min(prev.profiles_count, platform?.max_profiles || 1)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingPlan) {
      const { error } = await supabase
        .from('subscription_plans')
        .update(formData)
        .eq('id', editingPlan.id);

      if (error) {
        console.error('Error updating plan:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('subscription_plans')
        .insert([formData]);

      if (error) {
        console.error('Error adding plan:', error);
        return;
      }
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingPlan(null);
    setSelectedPlatform(null);
    setFormData({
      platform_id: '',
      name: '',
      profiles_count: 1,
      price_ar: 0,
      duration_months: 1
    });
    fetchPlans();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingPlan(null);
    setSelectedPlatform(null);
    setFormData({
      platform_id: '',
      name: '',
      profiles_count: 1,
      price_ar: 0,
      duration_months: 1
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Plans d'Abonnement</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Ajouter un Plan
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={isEditMode ? "Modifier le Plan" : "Ajouter un Plan"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Plateforme</label>
            <select
              value={formData.platform_id}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="">Sélectionner une Plateforme</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name} (max {platform.max_profiles} profils)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du Plan</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Profils</label>
            <input
              type="number"
              min="1"
              max={selectedPlatform?.max_profiles || 10}
              value={formData.profiles_count}
              onChange={(e) => setFormData({ ...formData, profiles_count: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
            {selectedPlatform && (
              <p className="mt-1 text-sm text-gray-500">
                Maximum {selectedPlatform.max_profiles} profils pour {selectedPlatform.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Durée (Mois)</label>
            <select
              value={formData.duration_months}
              onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="1">1 Mois (30 jours)</option>
              <option value="2">2 Mois (60 jours)</option>
              <option value="3">3 Mois (90 jours)</option>
              <option value="6">6 Mois (180 jours)</option>
              <option value="12">12 Mois (360 jours)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prix (Ar)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.price_ar}
              onChange={(e) => setFormData({ ...formData, price_ar: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleModalClose}
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

      {loading ? (
        <div className="text-center py-4">Chargement des plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <span className="text-sm text-gray-500">{plan.platform.name}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profils</span>
                    <span className="font-medium">{plan.profiles_count} / {plan.platform.max_profiles}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Durée</span>
                    <span className="font-medium">{plan.duration_months} mois</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prix</span>
                    <span className="font-medium">{plan.price_ar.toLocaleString()} Ar</span>
                  </div>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="w-full mt-4 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100"
                  >
                    Modifier le Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};