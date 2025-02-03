import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import type { AppSettings } from '@/types/settings';

interface GeneralSettingsProps {
  settings: AppSettings;
  onSave: (updates: Partial<AppSettings>) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Paramètres Généraux</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du Site</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => onSave({ site_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={settings.site_description}
              onChange={(e) => onSave({ site_description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => onSave({ contact_email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => onSave({ contact_phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => onSave({ address: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
