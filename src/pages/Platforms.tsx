import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Platform } from '../types/database';
import { Modal } from '../components/Modal';
import { Monitor, Trash2, Edit2 } from 'lucide-react';

export const Platforms = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    max_profiles: 5
  });

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    const { data, error } = await supabase
      .from('platforms')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching platforms:', error);
      return;
    }

    setPlatforms(data || []);
    setLoading(false);
  };

  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    setFormData({
      name: platform.name,
      logo_url: platform.logo_url || '',
      max_profiles: platform.max_profiles
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (platform: Platform) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la plateforme "${platform.name}" ?`)) {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', platform.id);

      if (error) {
        console.error('Error deleting platform:', error);
        alert('Impossible de supprimer la plateforme. Elle est peut-être utilisée par des comptes.');
        return;
      }

      fetchPlatforms();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingPlatform) {
      const { error } = await supabase
        .from('platforms')
        .update(formData)
        .eq('id', editingPlatform.id);

      if (error) {
        console.error('Error updating platform:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('platforms')
        .insert([formData]);

      if (error) {
        console.error('Error adding platform:', error);
        return;
      }
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingPlatform(null);
    setFormData({
      name: '',
      logo_url: '',
      max_profiles: 5
    });
    fetchPlatforms();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Plateformes de Streaming</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Ajouter une Plateforme
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingPlatform(null);
          setFormData({ name: '', logo_url: '', max_profiles: 5 });
        }}
        title={isEditMode ? "Modifier la Plateforme" : "Ajouter une Plateforme"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de la Plateforme</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">URL du Logo (optionnel)</label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Maximum de Profils</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.max_profiles}
              onChange={(e) => setFormData({ ...formData, max_profiles: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {isEditMode ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="text-center py-4">Chargement des plateformes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <div key={platform.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {platform.logo_url ? (
                      <img 
                        src={platform.logo_url} 
                        alt={platform.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Nombre maximum de profils : {platform.max_profiles}</p>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(platform)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(platform)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};