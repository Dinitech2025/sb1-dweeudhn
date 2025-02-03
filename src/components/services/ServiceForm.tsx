import React from 'react';
import { Button } from '../ui/Button';
import type { Service } from '@/types/database';

interface ServiceFormProps {
  formData: {
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
  };
  onChange: (data: Partial<typeof formData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEdit = false
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom du Service</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Prix (Ar)</label>
        <input
          type="number"
          min="0"
          step="100"
          value={formData.price}
          onChange={(e) => onChange({ price: parseFloat(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Durée (minutes)</label>
        <input
          type="number"
          min="1"
          value={formData.duration_minutes}
          onChange={(e) => onChange({ duration_minutes: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit">
          {isEdit ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};