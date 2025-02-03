import React from 'react';
import { Button } from '@/components/ui/Button';
import type { Customer, SubscriptionPlan, Account, Profile } from '@/types/database';

interface SubscriptionFormProps {
  customers: Customer[];
  plans: SubscriptionPlan[];
  availableAccounts: Account[];
  formData: {
    customer_id: string;
    account_id: string;
    profiles: string[];
    plan_id: string;
    start_date: string;
    end_date: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onCustomerChange: (id: string) => void;
  onPlanChange: (id: string) => void;
  onAccountChange: (id: string) => void;
  selectedPlan: SubscriptionPlan | null;
  selectedAccount: Account | null;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  customers,
  plans,
  availableAccounts,
  formData,
  onSubmit,
  onCustomerChange,
  onPlanChange,
  onAccountChange,
  selectedPlan,
  selectedAccount
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Client Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <select
          value={formData.customer_id}
          onChange={(e) => onCustomerChange(e.target.value)}
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

      {/* Plan Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Plan</label>
        <select
          value={formData.plan_id}
          onChange={(e) => onPlanChange(e.target.value)}
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

      {/* Account Selection */}
      {selectedPlan && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Compte</label>
          <select
            value={formData.account_id}
            onChange={(e) => onAccountChange(e.target.value)}
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

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Date de Début</label>
        <input
          type="date"
          value={formData.start_date}
          onChange={(e) => onCustomerChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date de Fin</label>
        <input
          type="date"
          value={formData.end_date}
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          La période d'abonnement est fixée à 30 jours
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="outline"
          type="button"
          onClick={() => onCustomerChange('')}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={!selectedPlan || !selectedAccount || formData.profiles.length === 0}
        >
          Créer l'Abonnement
        </Button>
      </div>
    </form>
  );
};