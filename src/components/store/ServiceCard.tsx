import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Wrench } from 'lucide-react';
import type { Service } from '@/types/store';

interface ServiceCardProps {
  service: Service;
  onAddToCart: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onAddToCart }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Wrench className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{service.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-gray-900">
                  {service.price.toLocaleString()} Ar
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  • {service.duration}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddToCart(service)}
              >
                Réserver
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
