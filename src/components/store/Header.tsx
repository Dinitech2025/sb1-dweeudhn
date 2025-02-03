import React from 'react';
import { Store as StoreIcon, Search, ShoppingCart, Menu } from 'lucide-react';
import type { StoreSettings } from '@/types/store';

interface HeaderProps {
  settings: StoreSettings;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  cartItemsCount: number;
  onCartClick: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  searchTerm,
  onSearchChange,
  cartItemsCount,
  onCartClick,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <StoreIcon className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              {settings.store_name}
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <nav className="hidden md:flex -mb-px">
          <button
            onClick={() => onCategoryChange('all')}
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeCategory === 'all'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tous les Produits
          </button>
          {settings.product_categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`mr-8 py-4 text-sm font-medium border-b-2 ${
                activeCategory === category.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
