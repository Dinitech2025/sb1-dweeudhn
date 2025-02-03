// Types pour la gestion des utilisateurs
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
}

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  module: string;
  created_at: string;
}

// Types pour la gestion des clients
export interface Customer {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  contact_channel: ContactChannel;
  address?: string;
  city?: string;
  notes?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  created_at: string;
}

export type ContactChannel = 
  | 'facebook_sb'
  | 'whatsapp_yas'
  | 'email'
  | 'sms_yas'
  | 'facebook_sab'
  | 'facebook_ssb'
  | 'facebook_bnk'
  | 'sms_orange'
  | 'call_yas'
  | 'call_orange';