import React from 'react';
import { Wrench, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Service } from '@/types/database';

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  onEdit,
  onDelete
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
    }
    return `${minutes}min`;
  };

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-gray-500">{service.description}</p>
                )}
                <div className="text-sm text-gray-500">
                  Durée: {formatDuration(service.duration_minutes)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold text-gray-900">
                {service.price.toLocaleString()} Ar
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(service)}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(service)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
