import React from 'react';
import { Button } from '../ui/Button';
import type { StoreSettings } from '@/types/store';

interface HeroProps {
  settings: StoreSettings;
}

export const Hero: React.FC<HeroProps> = ({ settings }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90" />
      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            {settings.seo_settings.title}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-200">
            {settings.seo_settings.description}
          </p>
          <div className="mt-10">
            <Button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50">
              Découvrir nos offres
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};