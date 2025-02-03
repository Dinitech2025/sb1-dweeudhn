import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Service } from '../types/database';
import { Modal } from '../components/Modal';
import { Button } from '../components/ui/Button';
import { ServiceList } from '../components/services/ServiceList';
import { ServiceForm } from '../components/services/ServiceForm';

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration_minutes: 30
  });

  useEffect(() => {
    fetchServices();
  }, []);

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
    setLoading(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration_minutes: service.duration_minutes
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (service: Service) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.name}" ?`)) {
      return;
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', service.id);

    if (error) {
      console.error('Error deleting service:', error);
      alert('Impossible de supprimer le service. Il est peut-être utilisé dans des ventes.');
      return;
    }

    fetchServices();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingService) {
      const { error } = await supabase
        .from('services')
        .update(formData)
        .eq('id', editingService.id);

      if (error) {
        console.error('Error updating service:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('services')
        .insert([formData]);

      if (error) {
        console.error('Error adding service:', error);
        return;
      }
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration_minutes: 30
    });
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Ajouter un Service
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingService(null);
          setFormData({
            name: '',
            description: '',
            price: 0,
            duration_minutes: 30
          });
        }}
        title={isEditMode ? "Modifier le Service" : "Ajouter un Service"}
      >
        <ServiceForm
          formData={formData}
          onChange={(data) => setFormData({ ...formData, ...data })}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isEdit={isEditMode}
        />
      </Modal>

      {loading ? (
        <div className="text-center py-4">Chargement des services...</div>
      ) : (
        <ServiceList
          services={services}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
