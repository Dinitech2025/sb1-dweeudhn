import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Expense } from '../types/database';
import { Modal } from '../components/Modal';
import { Receipt, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';

const EXPENSE_CATEGORIES = [
  'Loyer',
  'Électricité',
  'Internet',
  'Salaires',
  'Marketing',
  'Équipement',
  'Maintenance',
  'Transport',
  'Autres'
];

export const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: EXPENSE_CATEGORIES[0]
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return;
    }

    setExpenses(data || []);
    setLoading(false);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cette dépense ?`)) {
      return;
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expense.id);

    if (error) {
      console.error('Error deleting expense:', error);
      return;
    }

    fetchExpenses();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingExpense) {
      const { error } = await supabase
        .from('expenses')
        .update(formData)
        .eq('id', editingExpense.id);

      if (error) {
        console.error('Error updating expense:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('expenses')
        .insert([formData]);

      if (error) {
        console.error('Error adding expense:', error);
        return;
      }
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: EXPENSE_CATEGORIES[0]
    });
    fetchExpenses();
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dépenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total des dépenses: {totalExpenses.toLocaleString()} Ar
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          Ajouter une Dépense
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingExpense(null);
          setFormData({
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category: EXPENSE_CATEGORIES[0]
          });
        }}
        title={isEditMode ? "Modifier la Dépense" : "Ajouter une Dépense"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Montant (Ar)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              {EXPENSE_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {isEditMode ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="text-center py-4">Chargement des dépenses...</div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {expense.description}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{format(new Date(expense.date), 'PP')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-red-600">
                    {expense.amount.toLocaleString()} Ar
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expense)}
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
      )}
    </div>
  );
};