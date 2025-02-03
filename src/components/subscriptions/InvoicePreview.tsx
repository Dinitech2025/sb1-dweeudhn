import React from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import type { SubscriptionWithDetails } from '../../types/database';

interface InvoicePreviewProps {
  subscription: SubscriptionWithDetails;
  onDownload: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  subscription,
  onDownload
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-indigo-600">StreamShare</h2>
        <p className="text-sm text-gray-500">
          Facture #{subscription.id.slice(0, 8)}
        </p>
        <p className="text-sm text-gray-500">
          Date: {format(new Date(subscription.created_at), 'PPP')}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Informations Client</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium">{subscription.customer.name}</p>
          {subscription.customer.email && (
            <p className="text-sm text-gray-600">{subscription.customer.email}</p>
          )}
          {subscription.customer.phone && (
            <p className="text-sm text-gray-600">{subscription.customer.phone}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Détails de l'Abonnement</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan</span>
            <span className="font-medium">{subscription.plan.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Profils:</span>
            <ul className="mt-1 space-y-1">
              {subscription.profiles_data.map(profile => (
                <li key={profile.id} className="text-sm">
                  • {profile.profile_name}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Période</span>
            <span className="font-medium">
              {format(new Date(subscription.start_date), 'PP')} - {format(new Date(subscription.end_date), 'PP')}
            </span>
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