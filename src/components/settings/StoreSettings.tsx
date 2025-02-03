import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import type { StoreSettings as StoreSettingsType } from '@/types/settings';

interface StoreSettingsProps {
  settings: StoreSettingsType;
  onSave: (updates: Partial<StoreSettingsType>) => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({
  settings,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Paramètres de la Boutique</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de la Boutique</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => onSave({ store_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={settings.store_description}
              onChange={(e) => onSave({ store_description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input
                type="url"
                value={settings.store_logo_url || ''}
                onChange={(e) => onSave({ store_logo_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bannière URL</label>
              <input
                type="url"
                value={settings.store_banner_url || ''}
                onChange={(e) => onSave({ store_banner_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.store_enabled}
                onChange={(e) => onSave({ store_enabled: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Activer la boutique</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.allow_guest_checkout}
                onChange={(e) => onSave({ allow_guest_checkout: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Autoriser les commandes sans compte</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.show_out_of_stock}
                onChange={(e) => onSave({ show_out_of_stock: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Afficher les produits en rupture de stock</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Seuil de stock bas</label>
            <input
              type="number"
              min="0"
              value={settings.low_stock_threshold}
              onChange={(e) => onSave({ low_stock_threshold: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
            <p className="mt-1 text-sm text-gray-500">
              Vous serez notifié lorsque le stock d'un produit passe sous ce seuil
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};