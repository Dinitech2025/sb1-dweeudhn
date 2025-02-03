import React from 'react';
import { PlayCircle, Package, Star } from 'lucide-react';

export const Features = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center">
            <PlayCircle className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Streaming Premium</h3>
          <p className="mt-2 text-sm text-gray-500">
            Accédez aux meilleures plateformes de streaming en qualité HD/4K
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center">
            <Package className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Accessoires</h3>
          <p className="mt-2 text-sm text-gray-500">
            Découvrez notre sélection d'accessoires pour une expérience optimale
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center">
            <Star className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Support Premium</h3>
          <p className="mt-2 text-sm text-gray-500">
            Bénéficiez d'une assistance technique professionnelle 7j/7
          </p>
        </div>
      </div>
    </div>
  );
};