import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { StoreSettings } from '@/types/settings';

interface ShippingSettingsProps {
  settings: StoreSettings;
  onSave: (updates: Partial<StoreSettings>) => void;
}

export const ShippingSettings: React.FC<ShippingSettingsProps> = ({
  settings,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Zones de Livraison</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settings.shipping_zones.map((zone: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone</label>
                  <input
                    type="text"
                    value={zone.name}
                    onChange={(e) => {
                      const newZones = [...settings.shipping_zones];
                      newZones[index].name = e.target.value;
                      onSave({ shipping_zones: newZones });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frais de Livraison</label>
                  <input
                    type="number"
                    min="0"
                    value={zone.fee}
                    onChange={(e) => {
                      const newZones = [...settings.shipping_zones];
                      newZones[index].fee = parseInt(e.target.value);
                      onSave({ shipping_zones: newZones });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Délai Minimum (jours)</label>
                  <input
                    type="number"
                    min="0"
                    value={zone.min_delivery_days}
                    onChange={(e) => {
                      const newZones = [...settings.shipping_zones];
                      newZones[index].min_delivery_days = parseInt(e.target.value);
                      onSave({ shipping_zones: newZones });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Délai Maximum (jours)</label>
                  <input
                    type="number"
                    min="0"
                    value={zone.max_delivery_days}
                    onChange={(e) => {
                      const newZones = [...settings.shipping_zones];
                      newZones[index].max_delivery_days = parseInt(e.target.value);
                      onSave({ shipping_zones: newZones });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-red-600"
                onClick={() => {
                  const newZones = settings.shipping_zones.filter((_: any, i: number) => i !== index);
                  onSave({ shipping_zones: newZones });
                }}
              >
                Supprimer
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              const newZones = [
                ...settings.shipping_zones,
                {
                  name: '',
                  fee: 0,
                  min_delivery_days: 1,
                  max_delivery_days: 3
                }
              ];
              onSave({ shipping_zones: newZones });
            }}
          >
            Ajouter une zone
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};