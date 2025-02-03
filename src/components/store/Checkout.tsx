import React, { useState } from 'react';
import { Button } from '../ui/Button';
import type { CartItem } from '@/types/store';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onConfirmOrder: (formData: CheckoutFormData) => void;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  shippingZone: string;
  paymentMethod: string;
}

export const Checkout: React.FC<CheckoutProps> = ({
  isOpen,
  onClose,
  items,
  onConfirmOrder
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    shippingZone: 'Antananarivo',
    paymentMethod: 'cash'
  });

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = formData.shippingZone === 'Antananarivo' ? 5000 : 10000;
  const total = cartTotal + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmOrder(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Finaliser la commande</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Zone de livraison</label>
                <select
                  value={formData.shippingZone}
                  onChange={(e) => setFormData({ ...formData, shippingZone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                >
                  <option value="Antananarivo">Antananarivo (5,000 Ar)</option>
                  <option value="Province">Province (10,000 Ar)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mode de paiement</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                >
                  <option value="cash">Paiement à la livraison</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Sous-total</span>
                <span>{cartTotal.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span>Frais de livraison</span>
                <span>{shippingFee.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{total.toLocaleString()} Ar</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button type="submit">
                Confirmer la commande
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};