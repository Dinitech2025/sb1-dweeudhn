import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/store/Header';
import { Hero } from '@/components/store/Hero';
import { ProductList } from '@/components/store/ProductList';
import { Features } from '@/components/store/Features';
import { Footer } from '@/components/store/Footer';
import { Cart } from '@/components/store/Cart';
import { Checkout } from '@/components/store/Checkout';
import type { StoreSettings, CartItem, Product, Service } from '@/types/store';
import type { CheckoutFormData } from '@/components/store/Checkout';

export const Store = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      // Fetch store settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (settingsError) throw settingsError;

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) throw productsError;

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (servicesError) throw servicesError;

      setSettings(settingsData);
      setProducts(productsData || []);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: Product | Service) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
    setShowCart(true);
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleConfirmOrder = async (formData: CheckoutFormData) => {
    try {
      // Create customer if needed
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          contact_channel: 'email'
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: customer.id,
          total_amount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          date: new Date().toISOString().split('T')[0],
          status: 'completed'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cartItems.map(item => ({
        sale_id: sale.id,
        product_id: 'image' in item ? item.id : null,
        service_id: !('image' in item) ? item.id : null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of cartItems) {
        if ('image' in item) {
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: supabase.raw(`stock - ${item.quantity}`) })
            .eq('id', item.id);

          if (stockError) throw stockError;
        }
      }

      // Reset cart
      setCartItems([]);
      setShowCheckout(false);

      // Show success message
      alert('Votre commande a été enregistrée avec succès !');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        settings={settings}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cartItemsCount={cartItems.length}
        onCartClick={() => setShowCart(true)}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <Checkout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        items={cartItems}
        onConfirmOrder={handleConfirmOrder}
      />

      <Hero settings={settings} />

      <ProductList
        products={filteredProducts}
        services={filteredServices}
        activeCategory={activeCategory}
        onAddToCart={addToCart}
      />

      <Features />

      <Footer
        settings={settings}
        onCategoryChange={setActiveCategory}
      />
    </div>
  );
};