import React from 'react';
import { format } from 'date-fns';
import { Download, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { SubscriptionWithDetails } from '@/types/database';

interface SubscriptionListProps {
  subscriptions: SubscriptionWithDetails[];
  onViewInvoice: (subscription: SubscriptionWithDetails) => void;
  onDeleteSubscription: (subscription: SubscriptionWithDetails) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onViewInvoice,
  onDeleteSubscription
}) => {
  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex justify-between">
            <div className="space-y-4 flex-1">
              {/* Informations Client */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {subscription.customer.name}
                </h3>
                <div className="text-sm text-gray-500">
                  {subscription.customer.email && (
                    <p>{subscription.customer.email}</p>
                  )}
                  {subscription.customer.phone && (
                    <p>{subscription.customer.phone}</p>
                  )}
                </div>
              </div>

              {/* Détails de l'Abonnement */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Plan</p>
                    <p className="text-gray-600">{subscription.plan.name}</p>
                  </div>
                  <p className="font-semibold">{subscription.plan.price_ar.toLocaleString()} Ar</p>
                </div>

                <div>
                  <p className="font-medium mb-1">Profils:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {subscription.profiles_data.map(profile => (
                      <li key={profile.id}>{profile.profile_name}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center">
                  <p className="font-medium">Période</p>
                  <p className="text-gray-600">
                    {format(new Date(subscription.start_date), 'PP')} - {format(new Date(subscription.end_date), 'PP')}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="font-medium">Statut</p>
                  <Badge
                    variant={
                      subscription.status === 'active' ? 'success' :
                      subscription.status === 'expired' ? 'error' : 'warning'
                    }
                  >
                    {subscription.status === 'active' ? 'Actif' : 
                     subscription.status === 'expired' ? 'Expiré' : 'Annulé'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="ml-6 flex flex-col space-y-2">
              <button
                onClick={() => onViewInvoice(subscription)}
                className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => onDeleteSubscription(subscription)}
                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                title="Supprimer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
