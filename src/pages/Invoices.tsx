import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SubscriptionWithDetails, Sale } from '@/types/database';
import { Modal } from '@/components/Modal';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { generateInvoicePDF } from '@/utils/invoice';
import { generateSaleInvoicePDF } from '@/utils/sale-invoice';
import { SubscriptionInvoice } from '@/components/subscriptions/SubscriptionInvoice';
import { SaleInvoice } from '@/components/sales/SaleInvoice';

type InvoiceType = 'subscription' | 'sale';

interface InvoiceItem {
  id: string;
  type: InvoiceType;
  customer_name: string;
  customer_email: string | null;
  amount: number;
  date: string;
  data: SubscriptionWithDetails | Sale;
}

export const Invoices = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    // Fetch subscriptions
    const { data: subsData, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        customer:customers(*),
        plan:subscription_plans(*)
      `)
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      return;
    }

    // Get profiles for subscriptions
    const subscriptionsWithProfiles = await Promise.all(
      (subsData || []).map(async (sub) => {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', sub.profiles);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return {
            ...sub,
            profiles_data: []
          };
        }

        return {
          ...sub,
          profiles_data: profilesData || []
        };
      })
    );

    // Fetch sales
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        customer:customers(*),
        items:sale_items(
          *,
          product:products(*),
          service:services(*)
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (salesError) {
      console.error('Error fetching sales:', salesError);
      return;
    }

    // Combine and sort invoices
    const allInvoices: InvoiceItem[] = [
      ...(subscriptionsWithProfiles || []).map(sub => ({
        id: sub.id,
        type: 'subscription' as InvoiceType,
        customer_name: sub.customer.name,
        customer_email: sub.customer.email,
        amount: sub.plan.price_ar,
        date: sub.created_at,
        data: sub
      })),
      ...(salesData || []).map(sale => ({
        id: sale.id,
        type: 'sale' as InvoiceType,
        customer_name: sale.customer.name,
        customer_email: sale.customer.email,
        amount: sale.total_amount,
        date: sale.created_at,
        data: sale
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setInvoices(allInvoices);
    setLoading(false);
  };

  const handleViewInvoice = (invoice: InvoiceItem) => {
    setSelectedInvoice(invoice);
    setShowInvoice(true);
  };

  const handleDownloadInvoice = async () => {
    if (!selectedInvoice) return;

    if (selectedInvoice.type === 'subscription') {
      await generateInvoicePDF(selectedInvoice.data as SubscriptionWithDetails);
    } else {
      await generateSaleInvoicePDF(selectedInvoice.data as Sale);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
      </div>

      <Modal
        isOpen={showInvoice}
        onClose={() => {
          setShowInvoice(false);
          setSelectedInvoice(null);
        }}
        title="Aperçu de la Facture"
      >
        {selectedInvoice?.type === 'subscription' ? (
          <SubscriptionInvoice
            subscription={selectedInvoice.data as SubscriptionWithDetails}
            onDownload={handleDownloadInvoice}
          />
        ) : selectedInvoice?.type === 'sale' ? (
          <SaleInvoice
            sale={selectedInvoice.data as Sale}
            onDownload={handleDownloadInvoice}
          />
        ) : null}
      </Modal>

      {loading ? (
        <div className="text-center py-4">Chargement des factures...</div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={`${invoice.type}-${invoice.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{invoice.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.type === 'subscription'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {invoice.type === 'subscription' ? 'Abonnement' : 'Vente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.customer_name}
                    </div>
                    {invoice.customer_email && (
                      <div className="text-sm text-gray-500">
                        {invoice.customer_email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.amount.toLocaleString()} Ar
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(new Date(invoice.date), 'PP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-900"
                    >
                      <Download size={16} />
                      <span>Aperçu</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};