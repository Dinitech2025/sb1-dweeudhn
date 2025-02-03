import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Customer, Product, Service, Sale } from '@/types/database';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import { SaleList } from '@/components/sales/SaleList';
import { SaleForm } from '@/components/sales/SaleForm';
import { SaleInvoice } from '@/components/sales/SaleInvoice';
import { generateSaleInvoicePDF } from '@/utils/sale-invoice';

interface CartItem {
  type: 'product' | 'service';
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchProducts();
    fetchServices();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
      return;
    }

    setSales(data || []);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching customers:', error);
      return;
    }

    setCustomers(data || []);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProducts(data || []);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching services:', error);
      return;
    }

    setServices(data || []);
  };

  const addToCart = (type: 'product' | 'service', item: Product | Service) => {
    const existingItem = cartItems.find(
      cartItem => cartItem.type === type && cartItem.id === item.id
    );

    if (existingItem) {
      setCartItems(
        cartItems.map(cartItem =>
          cartItem.type === type && cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          type,
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        }
      ]);
    }
  };

  const removeFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    setCartItems(
      cartItems.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const handleViewInvoice = async (sale: Sale) => {
    setSelectedSale(sale);
    setShowInvoice(true);
  };

  const handleDownloadInvoice = async () => {
    if (selectedSale) {
      await generateSaleInvoicePDF(selectedSale);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) return;

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        customer_id: formData.customer_id,
        total_amount: total,
        date: formData.date,
        status: 'completed'
      }])
      .select(`
        *,
        customer:customers(*),
        items:sale_items(
          *,
          product:products(*),
          service:services(*)
        )
      `)
      .single();

    if (saleError || !sale) {
      console.error('Error creating sale:', saleError);
      return;
    }

    // Create sale items
    const saleItems = cartItems.map(item => ({
      sale_id: sale.id,
      product_id: item.type === 'product' ? item.id : null,
      service_id: item.type === 'service' ? item.id : null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) {
      console.error('Error creating sale items:', itemsError);
      return;
    }

    // Update product stock if needed
    for (const item of cartItems) {
      if (item.type === 'product') {
        const product = products.find(p => p.id === item.id);
        if (product) {
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.id);

          if (stockError) {
            console.error('Error updating product stock:', stockError);
          }
        }
      }
    }

    setIsModalOpen(false);
    setCartItems([]);
    setFormData({
      customer_id: '',
      date: new Date().toISOString().split('T')[0]
    });

    // Show invoice
    setSelectedSale(sale);
    setShowInvoice(true);

    // Refresh data
    fetchSales();
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ventes</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Nouvelle Vente
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCartItems([]);
          setFormData({
            customer_id: '',
            date: new Date().toISOString().split('T')[0]
          });
        }}
        title="Nouvelle Vente"
      >
        <SaleForm
          customers={customers}
          products={products}
          services={services}
          cartItems={cartItems}
          formData={formData}
          onCustomerChange={(id) => setFormData({ ...formData, customer_id: id })}
          onDateChange={(date) => setFormData({ ...formData, date })}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={showInvoice}
        onClose={() => {
          setShowInvoice(false);
          setSelectedSale(null);
        }}
        title="Facture"
      >
        {selectedSale && (
          <SaleInvoice
            sale={selectedSale}
            onDownload={handleDownloadInvoice}
          />
        )}
      </Modal>

      {loading ? (
        <div className="text-center py-4">Chargement des ventes...</div>
      ) : (
        <SaleList
          sales={sales}
          onViewInvoice={handleViewInvoice}
        />
      )}
    </div>
  );
};