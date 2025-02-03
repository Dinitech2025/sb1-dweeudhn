import React from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import type { SubscriptionWithDetails } from '@/types/database';

interface SubscriptionInvoiceProps {
  subscription: SubscriptionWithDetails;
  onDownload: () => void;
}

export const SubscriptionInvoice: React.FC<SubscriptionInvoiceProps> = ({
  subscription,
  onDownload
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-indigo-600">DINITECH</h2>
        <p className="text-sm text-gray-500">
          Facture #{subscription.id.slice(0, 8)}
        </p>
        <p className="text-sm text-gray-500">
          Date: {format(new Date(subscription.created_at), 'PPP')}
        </p>
      </div>

      <div>
        <h3 className="font-medium text-gray-700">Informations Client</h3>
        <div className="bg-gray-50 p-4 rounded-lg mt-2">
          <p className="font-semibold text-gray-900">{subscription.customer.name}</p>
          {subscription.customer.email && (
            <p className="text-gray-600">{subscription.customer.email}</p>
          )}
          {subscription.customer.phone && (
            <p className="text-gray-600">{subscription.customer.phone}</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-700">Détails de l'Abonnement</h3>
        <div className="bg-gray-50 p-4 rounded-lg mt-2 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Plan</p>
            <p className="font-medium text-gray-900">{subscription.plan.name}</p>
          </div>

          <div>
            <p className="text-gray-600">Profils:</p>
            <ul className="mt-1 space-y-1">
              {subscription.profiles_data.map(profile => (
                <li key={profile.id} className="text-sm text-gray-900">
                  • {profile.profile_name}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-gray-600">Période</p>
            <p className="font-medium text-gray-900">
              {format(new Date(subscription.start_date), 'PP')} - {format(new Date(subscription.end_date), 'PP')}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-indigo-600">
            {subscription.plan.price_ar.toLocaleString()} Ar
          </span>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>Merci de votre confiance !</p>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onDownload} className="flex items-center space-x-2">
          <Download size={20} />
          <span>Télécharger PDF</span>
        </Button>
      </div>
    </div>
  );
};
