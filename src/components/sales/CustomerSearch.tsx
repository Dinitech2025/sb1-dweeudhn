import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { Customer } from '@/types/database';

interface CustomerSearchProps {
  customers: Customer[];
  value: string;
  onChange: (customerId: string) => void;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  customers,
  value,
  onChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selectedCustomer = customers.find(c => c.id === value);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      if (!element.closest('[data-customer-search]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative" data-customer-search>
      <div className="relative">
        <input
          type="text"
          value={selectedCustomer ? selectedCustomer.name : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (value) onChange('');
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher un client..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {isOpen && filteredCustomers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-auto">
          {filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => {
                onChange(customer.id);
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="font-medium">{customer.name}</div>
              {(customer.email || customer.phone) && (
                <div className="text-sm text-gray-500">
                  {customer.email && <div>{customer.email}</div>}
                  {customer.phone && <div>{customer.phone}</div>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};