import React from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Sale } from '@/types/database';

interface SaleInvoiceProps {
  sale: Sale;
  onDownload: () => void;
}

export const SaleInvoice: React.FC<SaleInvoiceProps> = ({
  sale,
  onDownload
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-indigo-600">DINITECH</h2>
        <p className="text-sm text-gray-500">
          Facture #{sale.id.slice(0, 8)}
        </p>
        <p className="text-sm text-gray-500">
          Date: {format(new Date(sale.date), 'PPP')}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Informations Client</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium">{sale.customer.name}</p>
          {sale.customer.email && (
            <p className="text-sm text-gray-600">{sale.customer.email}</p>
          )}
          {sale.customer.phone && (
            <p className="text-sm text-gray-600">{sale.customer.phone}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Détails de la Vente</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          {sale.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {item.product?.name || item.service?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {item.quantity} x {item.unit_price.toLocaleString()} Ar
                </p>
              </div>
              <p className="font-medium">
                {item.total_price.toLocaleString()} Ar
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-indigo-600">
            {sale.total_amount.toLocaleString()} Ar
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