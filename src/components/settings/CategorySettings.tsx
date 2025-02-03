import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { StoreSettings } from '@/types/settings';

interface CategorySettingsProps {
  settings: StoreSettings;
  onSave: (updates: Partial<StoreSettings>) => void;
}

export const CategorySettings: React.FC<CategorySettingsProps> = ({
  settings,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Catégories de Produits</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settings.product_categories.map((category: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <input
                    type="text"
                    value={category.id}
                    onChange={(e) => {
                      const newCategories = [...settings.product_categories];
                      newCategories[index].id = e.target.value;
                      onSave({ product_categories: newCategories });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => {
                      const newCategories = [...settings.product_categories];
                      newCategories[index].name = e.target.value;
                      onSave({ product_categories: newCategories });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={category.description}
                  onChange={(e) => {
                    const newCategories = [...settings.product_categories];
                    newCategories[index].description = e.target.value;
                    onSave({ product_categories: newCategories });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  rows={2}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-red-600"
                onClick={() => {
                  const newCategories = settings.product_categories.filter((_: any, i: number) => i !== index);
                  onSave({ product_categories: newCategories });
                }}
              >
                Supprimer
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              const newCategories = [
                ...settings.product_categories,
                {
                  id: '',
                  name: '',
                  description: ''
                }
              ];
              onSave({ product_categories: newCategories });
            }}
          >
            Ajouter une catégorie
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
