import React from 'react';
import { ProductCard } from './ProductCard';
import { ServiceCard } from './ServiceCard';
import type { Product, Service } from '@/types/store';

interface ProductListProps {
  products: Product[];
  services: Service[];
  activeCategory: string;
  onAddToCart: (item: Product | Service) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  services,
  activeCategory,
  onAddToCart
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        {activeCategory === 'all' ? 'Tous nos Produits' : 
         activeCategory === 'streaming' ? 'Abonnements Streaming' :
         activeCategory === 'accessories' ? 'Accessoires' : 'Services'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}

        {activeCategory === 'services' && services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};