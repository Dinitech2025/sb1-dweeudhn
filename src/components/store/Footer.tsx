import React from 'react';
import type { StoreSettings } from '@/types/store';

interface FooterProps {
  settings: StoreSettings;
  onCategoryChange: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onCategoryChange }) => {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-gray-400">
              <p>{settings.store_phone}</p>
              <p>{settings.store_email}</p>
              <p>{settings.store_address}</p>
            </div>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Catégories</h3>
            <ul className="space-y-2 text-gray-400">
              {settings.product_categories.map((category: any) => (
                <li key={category.id}>
                  <button
                    onClick={() => onCategoryChange(category.id)}
                    className="hover:text-white"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Livraison</h3>
            <ul className="space-y-2 text-gray-400">
              {settings.shipping_zones.map((zone: any, index: number) => (
                <li key={index}>
                  {zone.name} - {zone.fee.toLocaleString()} Ar
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a
                href={settings.social_links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                Facebook
              </a>
              <a
                href={settings.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {settings.store_name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
