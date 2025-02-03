import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Settings as SettingsIcon, Store, CreditCard, Truck, Tag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { StoreSettings as StoreSettingsComponent } from '../components/settings/StoreSettings';
import { ShippingSettings } from '../components/settings/ShippingSettings';
import { CategorySettings } from '../components/settings/CategorySettings';
import type { AppSettings, StoreSettings } from '../types/settings';

export const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Récupérer l'onglet actif depuis l'URL ou utiliser 'general' par défaut
  const activeTab = searchParams.get('tab') || 'general';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Récupérer les paramètres de l'application
      const { data: appSettings, error: appError } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 'a1b2c3d4-5678-90ab-cdef-123456789abc')
        .single();

      if (appError) throw appError;

      // Récupérer les paramètres de la boutique
      const { data: storeData, error: storeError } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'c3d5e1f2-1234-5678-90ab-cdef01234567')
        .single();

      if (storeError) throw storeError;

      setSettings(appSettings);
      setStoreSettings(storeData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates: Partial<AppSettings>) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update(updates)
        .eq('id', 'a1b2c3d4-5678-90ab-cdef-123456789abc');

      if (error) throw error;

      fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleSaveStore = async (updates: Partial<StoreSettings>) => {
    try {
      const { error } = await supabase
        .from('store_settings')
        .update(updates)
        .eq('id', 'c3d5e1f2-1234-5678-90ab-cdef01234567');

      if (error) throw error;

      fetchSettings();
    } catch (error) {
      console.error('Error updating store settings:', error);
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: <SettingsIcon size={18} /> },
    { id: 'store', label: 'Boutique', icon: <Store size={18} /> },
    { id: 'payment', label: 'Paiement', icon: <CreditCard size={18} /> },
    { id: 'shipping', label: 'Livraison', icon: <Truck size={18} /> },
    { id: 'categories', label: 'Catégories', icon: <Tag size={18} /> }
  ];

  const handleTabChange = (tabId: string) => {
    if (tabId === 'general') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!settings || !storeSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-500">
            Impossible de charger les paramètres. Veuillez réessayer plus tard.
          </p>
          <Button
            onClick={fetchSettings}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-sm ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <GeneralSettings
              settings={settings}
              onSave={handleSave}
            />
          )}

          {activeTab === 'store' && (
            <StoreSettingsComponent
              settings={storeSettings}
              onSave={handleSaveStore}
            />
          )}

          {activeTab === 'shipping' && (
            <ShippingSettings
              settings={storeSettings}
              onSave={handleSaveStore}
            />
          )}

          {activeTab === 'categories' && (
            <CategorySettings
              settings={storeSettings}
              onSave={handleSaveStore}
            />
          )}
        </div>
      </div>
    </div>
  );
};