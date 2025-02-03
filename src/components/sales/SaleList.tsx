import React from 'react';
import { DollarSign } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Sale } from '@/types/database';
import { format } from 'date-fns';

interface SaleListProps {
  sales: Sale[];
}

export const SaleList: React.FC<SaleListProps> = ({ sales }) => {
  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <div
          key={sale.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {sale.customer.name}
                </h3>
                {sale.customer.email && (
                  <p className="text-sm text-gray-500">{sale.customer.email}</p>
                )}
                <div className="text-sm text-gray-500">
                  {format(new Date(sale.date), 'PP')}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {sale.total_amount.toLocaleString()} Ar
                </div>
                <Badge
                  variant={
                    sale.status === 'completed' ? 'success' :
                    sale.status === 'cancelled' ? 'error' : 'warning'
                  }
                >
                  {sale.status === 'completed' ? 'Complétée' :
                   sale.status === 'cancelled' ? 'Annulée' : 'En attente'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};