import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2, Search } from 'lucide-react';
import type { Customer, Product, Service } from '@/types/database';
import { CustomerSearch } from './CustomerSearch';

interface CartItem {
  type: 'product' | 'service';
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface SaleFormProps {
  customers: Customer[];
  products: Product[];
  services: Service[];
  cartItems: CartItem[];
  formData: {
    customer_id: string;
    date: string;
  };
  onCustomerChange: (id: string) => void;
  onDateChange: (date: string) => void;
  onAddToCart: (type: 'product' | 'service', item: Product | Service) => void;
  onRemoveFromCart: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  customers,
  products,
  services,
  cartItems,
  formData,
  onCustomerChange,
  onDateChange,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onSubmit,
  onCancel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-[calc(100vh-200px)]">
      {/* En-tête du formulaire */}
      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Client</label>
          <CustomerSearch
            customers={customers}
            value={formData.customer_id}
            onChange={onCustomerChange}
          />
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => onDateChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
      </div>

      {/* Contenu principal avec défilement */}
      <div className="flex-1 flex space-x-4 min-h-0">
        {/* Catalogue (produits et services) */}
        <div className="w-2/3 flex flex-col space-y-4 overflow-hidden border rounded-lg bg-gray-50">
          {/* Barre de recherche et onglets */}
          <div className="p-4 border-b bg-white">
            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                  activeTab === 'products'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Produits
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                  activeTab === 'services'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Services
              </button>
            </div>
          </div>

          {/* Liste des produits/services */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2">
              {activeTab === 'products' ? (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onAddToCart('product', product)}
                    disabled={product.stock === 0}
                    className={`p-2 text-sm text-left border rounded-lg bg-white ${
                      product.stock > 0
                        ? 'hover:bg-gray-50'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-gray-500">
                      {product.price.toLocaleString()} Ar
                    </div>
                    <div className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </div>
                  </button>
                ))
              ) : (
                filteredServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => onAddToCart('service', service)}
                    className="p-2 text-sm text-left border rounded-lg bg-white hover:bg-gray-50"
                  >
                    <div className="font-medium">{service.name}</div>
                    <div className="text-gray-500">
                      {service.price.toLocaleString()} Ar
                    </div>
                    <div className="text-sm text-gray-500">
                      {service.duration_minutes} min
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panier */}
        <div className="w-1/3 flex flex-col border rounded-lg">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-medium text-gray-900">Panier</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg border">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.price.toLocaleString()} Ar
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value))}
                      className="w-16 rounded-md border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between text-lg font-medium mb-4">
              <span>Total</span>
              <span>{calculateTotal().toLocaleString()} Ar</span>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={cartItems.length === 0}
              >
                Valider la Vente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};