import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer, ContactChannel } from '../types/database';
import { Modal } from '../components/Modal';
import { Trash2, Edit2 } from 'lucide-react';

const CONTACT_CHANNELS: { value: ContactChannel; label: string }[] = [
  { value: 'facebook_sb', label: 'Page Facebook SB' },
  { value: 'whatsapp_yas', label: 'WhatsApp Yas' },
  { value: 'email', label: 'Email' },
  { value: 'sms_yas', label: 'SMS Yas' },
  { value: 'facebook_sab', label: 'Page Facebook SaB' },
  { value: 'facebook_ssb', label: 'Page Facebook SsB' },
  { value: 'facebook_bnk', label: 'Page Facebook Bnk' },
  { value: 'sms_orange', label: 'SMS Orange' },
  { value: 'call_yas', label: 'Appel Yas' },
  { value: 'call_orange', label: 'Appel Orange' }
];

export const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contact_channel: 'facebook_sb' as ContactChannel
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return;
    }

    setCustomers(data || []);
    setLoading(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      contact_channel: customer.contact_channel
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ce client ?`)) {
      return;
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id);

    if (error) {
      console.error('Error deleting customer:', error);
      alert('Impossible de supprimer le client. Il a peut-être des abonnements actifs.');
      return;
    }

    fetchCustomers();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingCustomer) {
      const { error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', editingCustomer.id);

      if (error) {
        console.error('Error updating customer:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('customers')
        .insert([formData]);

      if (error) {
        console.error('Error adding customer:', error);
        return;
      }
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      contact_channel: 'facebook_sb'
    });
    fetchCustomers();
  };

  const getContactChannelLabel = (value: ContactChannel) => {
    return CONTACT_CHANNELS.find(channel => channel.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Ajouter un Client
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingCustomer(null);
          setFormData({
            name: '',
            email: '',
            phone: '',
            contact_channel: 'facebook_sb'
          });
        }}
        title={isEditMode ? "Modifier le Client" : "Ajouter un Client"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Canal de Contact</label>
            <select
              value={formData.contact_channel}
              onChange={(e) => setFormData({ ...formData, contact_channel: e.target.value as ContactChannel })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              {CONTACT_CHANNELS.map(channel => (
                <option key={channel.value} value={channel.value}>
                  {channel.label}
                </option>
              ))}
            </select>
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
        <div className="text-center py-4">Chargement des clients...</div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Canal de Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'Inscription
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {customer.email && (
                        <div>{customer.email}</div>
                      )}
                      {customer.phone && (
                        <div className="text-gray-400">{customer.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {getContactChannelLabel(customer.contact_channel)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
